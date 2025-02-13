import strawberry
from fastapi import FastAPI
from strawberry.asgi import GraphQL

from apps.views.graphql_views import Query
from apps.views.mutation import Mutation


# Create a Strawberry schema
schema = strawberry.Schema(query=Query,mutation=Mutation)
 
graphql_app = GraphQL(schema)

