import strawberry
from fastapi import FastAPI
from strawberry.asgi import GraphQL

from apps.views.graphql_views import Query as UserQuery
from apps.views.mutation import Mutation



from apps.views.grapql_aging import Query as AgingQuery


@strawberry.type
class Query(UserQuery,AgingQuery):
    pass

# Create a Strawberry schema
schema = strawberry.Schema(query=Query,mutation=Mutation)
 
graphql_app = GraphQL(schema)

