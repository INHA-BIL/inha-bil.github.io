# INHA Bayesian Inference LAB Website


## People Photo Optimization

Add People profile photos as JPG/JPEG files in `assets/img/people/`. Before committing, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\optimize-people-images.ps1
```

The script resizes only images whose longest side exceeds 400px, then saves them as JPEGs at quality 82. Existing optimized images are skipped. To recompress every People JPEG, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\optimize-people-images.ps1 -Force
```

Keep the original high-resolution photo outside this repository: the script replaces the web copy in place.

This repository contains the source code for the Bayesian Inference LAB website.

- Website: <https://bayesian-inference-lab.github.io>
- Lab: Bayesian Inference LAB, INHA University
- Framework: Jekyll
- Hosting: GitHub Pages

## 1. 처음 준비할 것

이 홈페이지는 Jekyll로 만들어져 있습니다. Jekyll은 Ruby 기반 정적 사이트 생성기입니다.

처음 작업하는 컴퓨터에서는 아래 프로그램이 필요합니다.

1. Git
2. Ruby
3. Bundler
4. Jekyll dependencies

## 2. Git 설치

Git이 없으면 아래 링크에서 설치합니다.

<https://git-scm.com/downloads>

설치 후 Git Bash 또는 PowerShell에서 확인합니다.

```bash
git --version
```

버전이 출력되면 설치가 된 것입니다.

## 3. Ruby 설치

Windows에서는 RubyInstaller를 사용하는 것이 가장 쉽습니다.

<https://rubyinstaller.org/downloads/>

추천:

- Ruby+Devkit 버전 설치
- 설치 마지막 단계에서 `ridk install` 실행
- 옵션이 나오면 `MSYS2 and MINGW development toolchain` 설치

설치 후 Git Bash 또는 PowerShell에서 확인합니다.

```bash
ruby -v
gem -v
```

둘 다 버전이 출력되어야 합니다.

## 4. 저장소 받기

처음 받는 경우:

```bash
git clone https://github.com/bayesian-inference-lab/bayesian-inference-lab.github.io.git
cd bayesian-inference-lab.github.io
```

이미 zip으로 받은 폴더가 있다면 해당 폴더에서 작업해도 됩니다. 단, GitHub에 push하려면 remote가 올바르게 연결되어 있어야 합니다.

remote 확인:

```bash
git remote -v
```

아래처럼 나와야 합니다.

```bash
origin  https://github.com/bayesian-inference-lab/bayesian-inference-lab.github.io.git (fetch)
origin  https://github.com/bayesian-inference-lab/bayesian-inference-lab.github.io.git (push)
```

다르게 나오면 수정합니다.

```bash
git remote set-url origin https://github.com/bayesian-inference-lab/bayesian-inference-lab.github.io.git
```

## 5. Ruby 패키지 설치

프로젝트 폴더에서 실행합니다.

```bash
bundle install
```

`bundle` 명령어가 없다고 나오면 먼저 Bundler를 설치합니다.

```bash
gem install bundler
bundle install
```

## 6. 로컬에서 홈페이지 확인

프로젝트 폴더에서 실행합니다.

```bash
bundle exec jekyll serve
```

브라우저에서 아래 주소로 접속합니다.

<http://localhost:4000>

서버를 끄려면 터미널에서 `Ctrl + C`를 누릅니다.

이미 4000번 포트가 사용 중이면 아래처럼 다른 포트를 사용합니다.

```bash
bundle exec jekyll serve --port 4001
```

브라우저 주소:

<http://localhost:4001>

## 7. 빌드 확인

배포 전에 사이트가 정상적으로 만들어지는지 확인합니다.

```bash
bundle exec jekyll build
```

성공하면 `_site` 폴더가 생성됩니다. `_site`는 자동 생성 결과물이므로 직접 수정하지 않습니다.

## 8. 자주 수정하는 파일

반복되는 콘텐츠는 `_data` 폴더에 있습니다.

| 내용 | 파일 |
| --- | --- |
| 연구실 구성원 | `_data/people.yml` |
| 논문 | `_data/publications.yml` |
| 소프트웨어 | `_data/software.yml` |
| 프로젝트 | `_data/projects.yml` |
| 사진 갤러리 | `_data/photos.yml` |

페이지 파일은 프로젝트 루트에 있습니다.

| 페이지 | 파일 |
| --- | --- |
| Home | `index.html` |
| People | `people.html` |
| Publications | `publications.html` |
| Software | `software.html` |
| Projects | `projects.html` |
| Photo | `photo.html` |
| Contact | `contact.html` |

공통 디자인 파일:

| 내용 | 파일 |
| --- | --- |
| 전체 레이아웃 | `_layouts/default.html` |
| 상단 메뉴 | `_includes/header.html` |
| 하단 영역 | `_includes/footer.html` |
| 스타일 | `assets/css/style.css` |
| JavaScript | `assets/js/main.js` |

## 9. People 수정 방법

연구실 구성원은 `_data/people.yml`에서 수정합니다.

예시:

```yaml
- name: Junhee Kim
  position: Master's Student
  group: Master's Students
  email: example@inha.edu
  image: /assets/img/kimjunhee.jpg
  photo_position: center 24%
  github: https://github.com/example
```

원형 프로필 사진 안에서 얼굴 위치가 어색하면 `photo_position`을 조정합니다.

예시:

```yaml
photo_position: center 12%
photo_position: center 35%
```

두 번째 값이 작을수록 사진이 아래로 내려 보이고, 클수록 위로 올라가 보입니다.

Alumni의 현재 소속이나 직장은 `current`에 적습니다.

```yaml
- name: Alumni Name
  position: MS, 2025.02
  group: Alumni
  current: Company or university name
  image: /assets/img/person-placeholder.svg
```

사용 가능한 group 예시:

- `Principal Investigator`
- `Ph.D. Students`
- `Master's Students`
- `Undergraduate Students`
- `Alumni`

사진은 `assets/img/` 폴더에 넣고 `image` 경로를 연결합니다.

## 10. Publications 수정 방법

논문 목록은 `_data/publications.yml`에서 수정합니다.

예시:

```yaml
- title: Paper title
  authors: Author A, Author B
  venue: Journal Name
  year: 2026
  status: Published
  link: https://doi.org/...
```

사용 가능한 `status` 값:

- `In Preparation`
- `In Presentation`
- `Under Review`
- `Working Papers`
- `Accepted`
- `Published`

현재 사이트에서는 논문별로 `Link` 버튼만 보여줍니다. DOI, PDF, Code를 따로 나누어 표시하지 않습니다.

## 11. Software 수정 방법

소프트웨어 목록은 `_data/software.yml`에서 수정합니다.

예시:

```yaml
- name: Package name
  description: Short description of the package.
```

현재 사이트에서는 `이름: 설명` 형식으로 보여줍니다.

## 12. Photo 수정 방법

사진 갤러리는 `_data/photos.yml`에서 수정합니다.

예시:

```yaml
- title: Photo title
  image: /assets/img/photo-file.jpg
  caption: Short caption.
  credit: Photographer name
  link: https://example.com
```

사진 파일은 `assets/img/`에 넣고 `image` 경로를 연결합니다. `link`, `caption`, `credit`은 없어도 됩니다.

## 13. 메뉴 수정 방법

상단 메뉴는 `_config.yml`의 `navigation`에서 수정합니다.

예시:

```yaml
navigation:
  - title: Home
    url: /
  - title: People
    url: /people/
```

새 페이지를 추가하려면 다음 두 가지를 모두 해야 합니다.

1. 루트에 `new-page.html` 파일 생성
2. `_config.yml`의 `navigation`에 메뉴 추가

## 14. 이미지 수정 방법

이미지는 보통 `assets/img/`에 넣습니다.

대표 이미지:

- 로고: `assets/img/logo.svg`
- 홈 화면 배경: `assets/img/hero-bayesian-lab.png`
- 기본 인물 사진: `assets/img/person-placeholder.svg`

이미지를 바꾼 뒤에는 로컬 서버를 새로고침해서 확인합니다. 브라우저 캐시 때문에 이전 이미지가 보이면 `Ctrl + F5`로 강력 새로고침합니다.

## 15. GitHub에 반영하기

수정 후 아래 순서로 진행합니다.

```bash
git status
git add -A
git commit -m "Update lab website"
git push
```

`git status`에서 `nothing to commit, working tree clean`이 나오면 Git이 볼 때 수정된 파일이 없다는 뜻입니다.

반영이 안 된 것처럼 보이면 다음을 확인합니다.

1. 실제로 저장한 폴더가 이 저장소 폴더인지 확인
2. 브라우저에서 강력 새로고침
3. `git status`로 변경 파일이 잡히는지 확인
4. GitHub Actions 또는 Pages 배포가 끝났는지 확인

## 16. 원격 저장소와 충돌이 날 때

다른 사람이 먼저 push한 경우 `git push`가 거절될 수 있습니다.

먼저 원격 변경사항을 받습니다.

```bash
git pull origin main
```

충돌이 없으면 다시 push합니다.

```bash
git push
```

충돌이 있으면 충돌 표시가 난 파일을 직접 수정한 뒤:

```bash
git add -A
git commit -m "Resolve merge conflict"
git push
```

## 17. 권한 오류가 날 때

아래 오류가 나면 현재 GitHub 계정에 저장소 쓰기 권한이 없는 것입니다.

```text
Permission denied
```

해결 방법:

1. GitHub organization 또는 repository의 collaborator 권한 확인
2. 올바른 GitHub 계정으로 로그인했는지 확인
3. Git Credential Manager에 저장된 잘못된 계정 정보를 삭제 후 다시 로그인

## 18. 자주 보는 오류

### `bundle` 명령어가 없음

```bash
gem install bundler
```

### `jekyll` 명령어가 없음

이 저장소에서는 직접 `jekyll` 대신 아래 명령을 사용합니다.

```bash
bundle exec jekyll serve
```

### 4000번 포트가 이미 사용 중

```bash
bundle exec jekyll serve --port 4001
```

### 수정했는데 Git이 변경사항을 못 찾음

확인할 것:

- 파일을 저장했는지
- 올바른 폴더에서 명령어를 실행했는지
- 실제 수정 파일이 `_site` 안쪽이 아닌지

`_site` 폴더는 빌드 결과물입니다. 원본 파일을 수정해야 합니다.

## 19. 작업 전 추천 순서

작업을 시작하기 전에 원격 저장소의 최신 상태를 받습니다.

```bash
git pull origin main
```

그 다음 로컬 서버를 켭니다.

```bash
bundle exec jekyll serve
```

수정 후 빌드를 확인합니다.

```bash
bundle exec jekyll build
```

문제가 없으면 commit하고 push합니다.

```bash
git add -A
git commit -m "Update content"
git push
```

## 20. 주의사항

- `_site` 폴더는 직접 수정하지 않습니다.
- 이미지 파일 이름에는 공백을 넣지 않는 것이 좋습니다.
- YAML 파일에서는 들여쓰기가 중요합니다.
- YAML에서 콜론(`:`)이 들어간 긴 문장은 따옴표로 감싸는 것이 안전합니다.
- 큰 변경 전에는 `git pull origin main`을 먼저 실행합니다.
- 여러 명이 동시에 수정할 때는 같은 파일을 동시에 고치면 충돌이 날 수 있습니다.
