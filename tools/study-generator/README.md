# 학습 화면(/study) 생성기

- `source/index.html` (+ `source/img/`): 학습 화면 기본 시안. 직접 고치지 않고 생성기가 읽기만 함.
- `make_study.py`: 기본 시안에 문자열 패치(`rep(a, b)`, 정확히 한 번 나와야 함)를 차례로 적용해 `../../study/index.html` 을 만든다.

```bash
python3 tools/study-generator/make_study.py
```

학습 화면을 고칠 때는 `study/index.html` 을 직접 고치지 말고 `make_study.py` 에 패치를 추가한 뒤 다시 실행한다. (직접 고치면 다음 생성 때 사라짐)
