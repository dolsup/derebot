# derebot
## ?
멘션에 '추천'이란 단어 들어가면 랜덤 추천해주는 트윗봇. 초밥 대가로 받아먹고 만들어주었다.
vocaro.wikidot.com/allsongs에서 곡을 파싱해 가져온다.

## dependency
- [twitter](https://www.npmjs.com/package/twitter)
- [cheerio](https://github.com/cheeriojs/cheerio)

## config.json
recommendation.js가 있는 디렉토리에 있어야 된다.
```json
{
	"id": "트위터 계정명(screen_name)",
	"pw": "비밀번호",
	"key": "앱 키",
	"secret": "앱 시크릿",
	"token": {
		"key": "액세스 토큰 키",
		"secret": "액세스 토큰 시크릿"
	},
	"interval": 60000,
	"lastLoadTime": "Mon Oct 12 10:55:05 +0000 2015",
	"lastCrawlTime": "2015-10-11T23:21:50.427Z"
}

```
- `interval` : 멘션 확인 주기. API 리미트 때문에 1분에 한 번
- `lastLoadTime`, `lastCrawlTime` : 자동으로 생성, 기록된다. 만들 필요 없다
