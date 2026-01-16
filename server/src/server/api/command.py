# from datetime import datetime
# from typing import Any, Dict
# from uuid import UUID
# from pydantic import BaseModel, Field

# class Command(BaseModel):
#     command_id: UUID
#     payload: Dict[str, Any]

# class CommandBatch(BaseModel):
#     base_version: int
#     commands: list[Command]

# class CommandResult(BaseModel):
#     command_id: UUID
#     type: str
#     status: str
#     result: Any = None
#     error: str = None

# command_registry = {}

# def command_handler(name):
#     def decorator(func):
#         command_registry[name] = func
#         return func
#     return decorator

# # 테스트용 명령어
# @command_handler("echo")
# def echo_command(command: Command, db) -> CommandResult:

#     message = command.payload.get("message", "")
#     return {"message": message}
