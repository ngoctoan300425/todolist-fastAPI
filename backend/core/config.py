from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "ToDo API"
    debug: bool = True
    database_url: str = "sqlite:///./todos.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
