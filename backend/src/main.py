from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from .database import get_context

graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True 
)

app = FastAPI()

# Gắn router GraphQL vào app FastAPI
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
async def root():
    return {"message": "API Quản lý Hội thảo Khoa học", "docs": "/graphql"}