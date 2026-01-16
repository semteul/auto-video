from server.database.models import ProjectModel, FileModel
from sqlalchemy.orm import Session


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, project_id: str):
        return self.db.query(ProjectModel).filter(ProjectModel.id == project_id).first()

    def get_all(self):
        return self.db.query(ProjectModel).all()

    def create(self, id: str, body=None):
        project = ProjectModel(id=id, body=body)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project_id: str, **kwargs):
        project = self.get(project_id)
        if not project:
            return None
        for key, value in kwargs.items():
            setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project_id: str):
        project = self.get(project_id)
        if not project:
            return False
        self.db.delete(project)
        self.db.commit()
        return True


class FileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, file_id: str):
        return self.db.query(FileModel).filter(FileModel.id == file_id).first()

    def get_all(self):
        return self.db.query(FileModel).all()

    def create(
        self,
        id: str,
        project_id: str,
        bucket_name: str,
        object_name: str,
        size: int,
        name: str,
        delete_date=None,
    ):
        file = FileModel(
            id=id,
            project_id=project_id,
            bucket_name=bucket_name,
            object_name=object_name,
            size=size,
            name=name,
            delete_date=delete_date,
        )
        self.db.add(file)
        self.db.commit()
        self.db.refresh(file)
        return file

    def update(self, file_id: str, **kwargs):
        file = self.get(file_id)
        if not file:
            return None
        for key, value in kwargs.items():
            setattr(file, key, value)
        self.db.commit()
        self.db.refresh(file)
        return file

    def delete(self, file_id: str):
        file = self.get(file_id)
        if not file:
            return False
        self.db.delete(file)
        self.db.commit()
        return True
