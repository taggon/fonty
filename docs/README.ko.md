# Fonty : 웹 폰트를 생성하는 간단한 라이브러리 및 CLI 도구

* [English](../README.md)

## 필요사항

* Node >= 6.0

## 사용법
```
const fonty = require('fonty');

fonty( 'path/to/source.ttf', 'path/to/output', options );
```

만약 `path/to/output`가 디렉토리라면 `path/to/output/`처럼 슬래시(`/`)를 경로 끝에 추가해야 합니다.

### 옵션

* `base64`: 이 옵션이 `true`이면 `css` 옵션이 자동으로 켜지고, 출력된 CSS 파일에는 base64로 인코딩된 웹 폰트 데이터가 포함됩니다.
* `css`: 이 옵션이 `true`이면 `fonty`는 생성된 웹 폰트를 위한 CSS 파일을 생성합니다.
* `glyph`: 출력 폰트 파일이 포함해야 할 문자 목록이 담긴 문자열입니다. 아무런 값도 설정하지 않으면 원본 폰트에 포함된 모든 글자가 그대로 보존됩니다.
* `optimize`: 이 옵션이 `true`이면 스페이스를 제외한 모든 공백 문자가 제거됩니다.
* `type`: 출력할 웹 폰트 파일의 타입을 나타내는 배열입니다. 기본값: `['ttf', 'eot', 'svg', 'woff', 'woff2']`.

주의: 만약 `glyph` 문자열에 스페이스가 포함되어 있다면 `fonty`는 줄바꿈 문자와 캐리지 리턴 문자도 스페이스에 연결(alias)합니다.
웹 폰트 파일에 줄바꿈 문자가 없으면 MS IE/Edge가 이상한 문자를 줄 끝에 출력하기 때문입니다.

### 이벤트

앞서 살펴본 `fonty` 함수는 각 타입을 대표하는 Promise가 저장된 배열을 반환합니다. 다음 코드를 봅시다.

```
fonty( 'path/to/source.ttf', 'path/to/output', options ).map( promise => {
	promise.done( (type) => {
		console.log( `.${type} file has been converted.` );
	} );
} );
```

위 코드는 각 타입의 파일 변환이 완료될 때마다 콘솔에 메시지를 출력합니다.

### CLI 도구

먼저 전역 영역에 이 도구를 설치하세요.

```
$ npm i -g fonty
```

그 뒤 다음과 같이 사용하세요.

```
$ fonty [options] path/to/source.ttf [path/to/output]
```

포함할 문자 목록을 `glyphs.txt`에 저장해두었고, `font.ttf` 파일로부터 `eot`, `woff` 웹 폰트를 작성하고 싶다고 가정해봅시다.
문자 목록은 다음과 같이 `fonty`에 전달할 수 있습니다.

```
$ text=`cat glyphs.txt` fonty -g="$text" -t="eot,woff" font.ttf
```

커맨드라인에서 `fonty`만 입력해서 실행하면 더 자세한 도움말을 볼 수 있습니다.

## 라이선스

이 라이브러리는 MIT 라이선스로 공개되었습니다.
