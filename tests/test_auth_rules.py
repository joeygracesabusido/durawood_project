"""Auth regression tests: no DB needed, module `mydb` globals are faked."""
import asyncio
import unittest
from types import SimpleNamespace
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt
from fastapi import HTTPException
from starlette.requests import Request


def _cookie_request(token_value=None):
    headers = []
    if token_value is not None:
        headers = [(b"cookie", f"access_token={token_value}".encode())]
    return Request({"type": "http", "method": "GET", "headers": headers})


class FakeCursor(list):
    def sort(self, *a, **k):
        return self


class FakeCollection:
    def __init__(self, docs=None):
        self.docs = docs or []
        self.saved = []

    def _match(self, doc, query):
        for k, v in query.items():
            if k == "$and":
                if not all(self._match(doc, part) for part in v):
                    return False
            elif isinstance(v, dict) and "$in" in v:
                if doc.get(k) not in v["$in"]:
                    return False
            elif doc.get(k) != v:
                return False
        return True

    def find_one(self, query):
        for d in self.docs:
            if self._match(d, query):
                return d
        return None

    def find(self, query=None):
        if not query:
            return FakeCursor(self.docs)
        return FakeCursor([d for d in self.docs if self._match(d, query)])

    def insert_one(self, doc):
        self.saved.append(doc)
        return SimpleNamespace(inserted_id="fake-id")

    def update_one(self, query, update):
        for d in self.docs:
            if self._match(d, query):
                d.update(update.get("$set", {}))
                return SimpleNamespace(matched_count=1)
        return SimpleNamespace(matched_count=0)


ADMIN_ACC = ["User Update", "Sales", "Payment", "Allowed Roles"]
SALES_ACC = ["Sales", "Payment"]


def make_login_docs():
    from bson import ObjectId
    now = datetime.now(timezone.utc)
    pw = bcrypt.hashpw(b"secret123", bcrypt.gensalt()).decode()
    return [
        {"_id": ObjectId(), "email_add": "admin@shop.com", "password": pw, "status": "Approved",
         "fullname": "Boss", "role": "Admin", "created": now},
        {"_id": ObjectId(), "email_add": "staff@shop.com", "password": pw, "status": "Approved",
         "fullname": "Staff", "role": "Sales-Person", "created": now},
        {"_id": ObjectId(), "email_add": "new@shop.com", "password": pw, "status": "Pending",
         "fullname": "New", "role": "Sales-Person", "created": now},
    ]


def make_roles_docs():
    return [
        {"role": "Admin", "allowed_access": ADMIN_ACC},
        {"role": "Sales-Person", "allowed_access": SALES_ACC},
    ]


def bearer(email, secret, minutes=30):
    token = jwt.encode({"sub": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=minutes)},
                       secret, algorithm="HS256")
    return f"Bearer {token}"


class AuthRulesTest(unittest.TestCase):
    def test_signup_forces_pending(self):
        import apps.routes.admin as admin_mod
        admin_mod.mydb = SimpleNamespace(login=FakeCollection())
        out = admin_mod.sign_up(admin_mod.SignUpModel(
            fullname="Sneaky", email_add="s@x.com", password="pw123456",
            status="Approved", role="Admin"))
        self.assertEqual(out, {"message": "User has been saved"})
        saved = admin_mod.mydb.login.saved[0]
        self.assertEqual(saved["status"], "Pending")
        self.assertTrue(bcrypt.checkpw(b"pw123456", saved["password"].encode()))

    def test_current_user_ok_and_rejects(self):
        import apps.authentication.authenticate_user as auth_mod
        auth_mod.mydb = SimpleNamespace(login=FakeCollection(make_login_docs()))
        good = _cookie_request(bearer("staff@shop.com", auth_mod.JWT_SECRET))
        self.assertEqual(auth_mod.get_current_user(good), "staff@shop.com")
        for bad_email in ("ghost@shop.com", "new@shop.com"):
            bad = _cookie_request(bearer(bad_email, auth_mod.JWT_SECRET))
            with self.assertRaises(HTTPException):
                auth_mod.get_current_user(bad)
        with self.assertRaises(HTTPException):
            auth_mod.get_current_user(_cookie_request())

    def test_oauth_cookie_returns_token(self):
        import apps.authentication.utils as utils_mod
        token = bearer("staff@shop.com", "myjwtsecret")
        out = asyncio.run(utils_mod.OAuth2PasswordBearerWithCookie(tokenUrl="token")(
            _cookie_request(token)))
        self.assertTrue(out and out.startswith("eyJ"))

    def test_users_list_gated(self):
        import apps.routes.admin as admin_mod
        admin_mod.mydb = SimpleNamespace(login=FakeCollection(make_login_docs()),
                                         roles=FakeCollection(make_roles_docs()))
        out = asyncio.run(admin_mod.get_user_list(username="admin@shop.com"))
        self.assertEqual(len(out), 3)
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(admin_mod.get_user_list(username="staff@shop.com"))
        self.assertEqual(ctx.exception.status_code, 401)

    def test_update_user_gated(self):
        import apps.routes.admin as admin_mod
        from bson import ObjectId
        docs = [{"_id": ObjectId(), "email_add": "x@y.com", "status": "Pending", "role": "Sales-Person"}]
        admin_mod.mydb = SimpleNamespace(login=FakeCollection(make_login_docs() + docs),
                                         roles=FakeCollection(make_roles_docs()))
        with self.assertRaises(HTTPException):
            asyncio.run(admin_mod.api_update_employee(
                id=str(docs[0]["_id"]),
                data=admin_mod.UpdateUser(status="Approved"), username="staff@shop.com"))
        self.assertEqual(docs[0]["status"], "Pending")

    def test_graphql_permission(self):
        import apps.views.graphql_views as views_mod
        import apps.authentication.authenticate_user as auth_mod
        auth_mod.mydb = SimpleNamespace(login=FakeCollection(make_login_docs()))
        perm = views_mod.IsLoggedIn()
        info_in = SimpleNamespace(context={"request": _cookie_request(
            bearer("staff@shop.com", auth_mod.JWT_SECRET))})
        self.assertTrue(perm.has_permission(None, info_in))
        info_out = SimpleNamespace(context={"request": _cookie_request()})
        self.assertFalse(perm.has_permission(None, info_out))

    def test_login_rejects_bad_password(self):
        import apps.routes.login as login_mod
        login_mod.mydb = SimpleNamespace(login=FakeCollection(make_login_docs()))
        self.assertFalse(login_mod.authenticate_user("staff@shop.com", "wrong"))
        user = login_mod.authenticate_user("staff@shop.com", "secret123")
        self.assertTrue(user)


if __name__ == "__main__":
    unittest.main()
