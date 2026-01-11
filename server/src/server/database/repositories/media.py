from sqlalchemy.orm import Session
from ..models import User, Project, ProjectMedia

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all(self) -> list[User]:
        return self.db.query(User).all()

    def create(self, name: str) -> User:
        user = User(name=name)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: int) -> bool:
        user = self.get(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, project_id: int) -> Project | None:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_all(self) -> list[Project]:
        return self.db.query(Project).all()

    def create(self, title: str) -> Project:
        project = Project(title=title)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project_id: int) -> bool:
        project = self.get(project_id)
        if project:
            self.db.delete(project)
            self.db.commit()
            return True
        return False
    
class ProjectMediaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, media_id: int) -> ProjectMedia | None:
        return self.db.query(ProjectMedia).filter(ProjectMedia.id == media_id).first()

    def get_all(self) -> list[ProjectMedia]:
        return self.db.query(ProjectMedia).all()

    def create(self, object_key: str, name: str, project: Project) -> ProjectMedia:
        media = ProjectMedia(object_key=object_key, name=name, project=project)
        self.db.add(media)
        self.db.commit()
        self.db.refresh(media)
        return media

    def delete(self, media_id: int) -> bool:
        media = self.get(media_id)
        if media:
            self.db.delete(media)
            self.db.commit()
            return True
        return False