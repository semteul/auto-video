---
title: Documentation
nav_order: 2
---

# 문서 작성
문서 작성은 Jekyll의 Just-The-Docs를 사용하고 있다.

1. 문서 상단마다 
```
---
title: 제목이름
nav_order: 1
---
```

사용. nav_order는 생략 가능하나, 순서 지정 필요할 경우 필수적으로 사용할것

2. 새로운 폴더 만들경우 index.md가 루트페이지 역할을 함

마찬가지로 문서 상단에 title과 nav_order를 지정할것


# 문서 배포
main에 push될 경우 알아서 Github Pages로 배포된다.

[https://semteul.github.io/auto-video/](https://semteul.github.io/auto-video/)