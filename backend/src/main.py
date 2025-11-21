from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from .database import get_context
from fastapi.middleware.cors import CORSMiddleware
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True 
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Origin của Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Gắn router GraphQL vào app FastAPI
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
async def root():
    return {"message": "API Quản lý Hội thảo Khoa học", "docs": "/graphql"}