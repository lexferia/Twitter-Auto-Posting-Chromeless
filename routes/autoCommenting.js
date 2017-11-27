const router = require('express').Router()
const { Chromeless } = require('chromeless')
const publicIp = require('public-ip')
// const shuffle = require('shuffle-array')
// const Excel = require('exceljs')
const Sequelize = require('sequelize')
const sequelize = new Sequelize('twitter_autoposting','root','sparrow01', {
  host: 'localhost',
  port: 3307,
  dialect: 'mysql',
  dialectOptions: {
    multipleStatements: true
  },
  define: {
    timestamps: false
  },

  pool: {
    max: 5,
    min: 0,
    idle: 1000
  }
})
const keywordsModel = require('./../models/keywords.js')(sequelize, Sequelize)
const socket = require('socket.io-client')('http://localhost:7070')
const AutoRegistration = require('./../lib/AutoRegistration')

var _autoRegistration
var _chromeless
var _username = 'chloebegum13@twitter10.com'
var _password = 'chloebegum13chloebegum13'
var _postMessage = `국내 최고 스포츠 배팅사이트 ▶ GTA369.com ◀
오픈톡문의 : gta365
#카지노
#온라인카지노
#축구배팅
#카지노게임
#라이브카지노
#스포츠배팅사이트
#스포츠토토
#스포츠배팅
#스포츠오드스`
var _commentMessage = `국내 최고 스포츠 배팅사이트 ★ gta-ss.com ★
가입코드: gta38
오픈톡문의 :gta365
#안전놀이터
#온라인카지노
#축구배팅
#메이저사이트
#라이브카지노
#스포츠배팅사이트
#스포츠토토
#스포츠배팅
#1분미니게임
#1분알라딘
#1분로하이`
var _photo = 'C:\/Users\/TeleEmpire\/Desktop\/GTA369\/1.jpg'
var _trendTopicId = ''
var _trendTopic = ''
var _noOfTopic = 10
var _retweetCount = 50
var _maxCommentCount = 20
var _commentCount = 0
var _successCommentCount = 0
var _unsuccessCommentCount = 0
var _keywords = ''
var _keywordsCount = 0
var _totalCommentCount = 0
var _maxTotalCommentCount = 5

router.post('/stop', async (req, res) =>  {
    _autoRegistration = null
    _chromeless.end()
    process.exit()
})

socket.on('request data', () => {

    keywordsModel.findAndCountAll().then(datas => {
      _keywords = datas.rows
      _keywordsCount = datas.count - 1

      socket.emit('fetch keywords', { keywords: _keywords })

    }).catch(err => {
      socket.emit('fetch keywords', { keywords: [] })
    })

})

router.get('/', (req, res) => {

    publicIp.v4().then((ip) => {
      console.log(ip)
    })

    res.render('main', {
      username: _username,
      password: _password,
      postMessage: _postMessage,
      commentMessage: _commentMessage,
      photo: _photo,
      noOfTopic: _noOfTopic,
      retweetCount: _retweetCount,
      maxCommentCount: _maxCommentCount
    })

})

router.post('/keywords', (req, res) =>  {

    switch (req.body.action) {
      case 'Insert':

        sequelize.query(`
          INSERT INTO keywords(id, keyword)
          VALUES(:id, :keyword);
        `, {
          type: sequelize.QueryTypes.INSERT,
          replacements: {
            id: req.body.id,
            keyword: req.body.keyword
          }
        }).then(users => {

           res.json({ refresh: true })

           keywordsModel.findAndCountAll().then(datas => {
             _keywords = datas.rows
             _keywordsCount = datas.count - 1

             socket.emit('fetch keywords', { keywords: _keywords })

           }).catch(err => {
             socket.emit('fetch keywords', { keywords: [] })
           })

        }).catch(err => {
          console.log(err)
        })

        break

      case 'Update':

        sequelize.query(`
          UPDATE keywords SET keyword=:keyword WHERE id=:id;
        `, {
          type: sequelize.QueryTypes.UPDATE,
          replacements: {
            id: req.body.id,
            keyword: req.body.keyword
          }
        }).then(users => {

           res.json({ refresh: true })

           keywordsModel.findAndCountAll().then(datas => {
             _keywords = datas.rows
             _keywordsCount = datas.count - 1

             socket.emit('fetch keywords', { keywords: _keywords })

           }).catch(err => {
             socket.emit('fetch keywords', { keywords: [] })
           })

        }).catch(err => {
          console.log(err)
        })

        break

      case 'Delete':

        sequelize.query(`
          DELETE FROM keywords WHERE id=:id;
        `, {
          type: sequelize.QueryTypes.DELETE,
          replacements: {
            id: req.body.id
          }
        }).then(users => {

          res.json({ refresh: true })

          keywordsModel.findAndCountAll().then(datas => {
            _keywords = datas.rows
            _keywordsCount = datas.count - 1

            socket.emit('fetch keywords', { keywords: _keywords })

          }).catch(err => {
            socket.emit('fetch keywords', { keywords: [] })
          })

        }).catch(err => {
          console.log(err)
        })

        break

      case 'DeleteAll':

        sequelize.query(`
          DELETE FROM keywords;
        `, {
          type: sequelize.QueryTypes.DELETE,
          replacements: {
            id: req.body.id
          }
        }).then(users => {

          res.json({ refresh: true })

          keywordsModel.findAndCountAll().then(datas => {
            _keywords = datas.rows
            _keywordsCount = datas.count - 1

            socket.emit('fetch keywords', { keywords: _keywords })

          }).catch(err => {
            socket.emit('fetch keywords', { keywords: [] })
          })

        }).catch(err => {
          console.log(err)
        })

        break
    }
})

function UpdateKeywordStatus(id, successful_count, unsuccessful_count) {
  sequelize.query(`
    UPDATE keywords SET is_used=1, successful_comment=:successful_comment, unsuccessful_comment:=unsuccessful_comment WHERE id=:id;
  `, {
    type: sequelize.QueryTypes.UPDATE,
    replacements: {
      id: id,
      successful_comment: successful_count,
      unsuccessful_comment: unsuccessful_count
    }
  }).then(users => {

    console.log('keyword updated.')

     keywordsModel.findAndCountAll().then(datas => {
       _keywords = datas.rows
       _keywordsCount = datas.count - 1

       socket.emit('fetch keywords', { keywords: _keywords })

     }).catch(err => {
       socket.emit('fetch keywords', { keywords: [] })
     })

  }).catch(err => {
    console.log(err)
  })
}

router.post('/trending', (req, res) => {

    _noOfTopic = req.body.noOfTopic

    _chromeless = new Chromeless()
    _chromeless
    .goto('http://datalab.naver.com/keyword/realtimeList.naver?where=main#')
    .wait('.section_lst_area.carousel_area .keyword_rank')
    .then((trendTopic) => {

        getTopTrending(1)

        res.status(200)
        res.send('success')

    })
    .catch(err => {
      res.status(422)
      res.send(err)
    })

})

router.post('/start', async (req, res) => {

    console.log(req.body.externalIP)
    _username = req.body.username
    _password = req.body.password
    _postMessage = req.body.postMessage
    _commentMessage = req.body.commentMessage
    _photo = req.body.photo
    _noOfTopic = req.body.noOfTopic
    _retweetCount = req.body.retweetCount
    _maxCommentCount = req.body.maxCommentCount

    _chromeless = new Chromeless()
    _autoRegistration = new AutoRegistration(_chromeless)

    await _autoRegistration.startRegistration()

    _username = _autoRegistration.fullEmail()
    _password = _autoRegistration.password

    await startLogin()

    // _chromeless
    // .goto('https://twitter.com/')
    // .wait('.front-card')
    // .type('#signin-email', _username)
    // .type('#signin-password', _password)
    // .wait(2000)
    // .click('.submit.EdgeButton.EdgeButton--medium.EdgeButton--secondary.flex-table-btn.js-submit')
    // .then(() => {
    //   initializeBrowsing(0)
    // })
    // .catch((err) => {
    //   console.log(err)
    // })

    res.json({
      username: _username,
      password: _password,
      postMessage: _postMessage,
      commentMessage: _commentMessage,
      photo: _photo,
      noOfTopic: _noOfTopic,
      retweetCount: _retweetCount,
      maxCommentCount: _maxCommentCount
    })

})

function getTopTrending(index) {

    _chromeless
    .wait(1000)
    .evaluate((index) => {
      let trendTopic = document.querySelectorAll('.section_lst_area.carousel_area .keyword_rank')[0].querySelectorAll('div div ul li')[index-1].querySelector('a .title').innerHTML

      return trendTopic
    }, index)
    .then((trendTopic) => {

      sequelize.query(`
        INSERT INTO keywords(id, keyword)
        VALUES(UUID(), :keyword);
      `, {
        type: sequelize.QueryTypes.INSERT,
        replacements: {
          keyword: trendTopic
        }

      }).then(users => {

        if (index < _noOfTopic) {
          getTopTrending(index + 1)
        } else {
          socket.emit('GetTrending Completed')
          console.log('Top trending has fetched.')
        }

      }).catch(err => {
        socket.emit('GetTrending Completed')
        console.log(err)
      })

    })
    .catch(err => {
      socket.emit('GetTrending Completed')
      console.log(err)
    })

}

function startLogin() {

    return new Promise(async (resolve, reject) => {

      socket.emit('updateLoggedUserInfo', {
        username: _username,
        password: _password,
        totalComment: _totalCommentCount
      })

      console.log('Start logging fullname = ' + _autoRegistration.fullname + ' username = ' + _username + ' and password = ' + _password)

      // await _chromeless
      // .goto('https://twitter.com/')
      // .wait('.front-card')
      // .type('#signin-email', _username)
      // .type('#signin-password', _password)
      // .wait(2000)
      // .click('.submit.EdgeButton.EdgeButton--medium.EdgeButton--secondary.flex-table-btn.js-submit')
      // .then(async () => {
      //
      //   let browsingResult = await initializeBrowsing(0)
      //
      //   resolve(browsingResult)
      //
      // })
      // .catch((err) => {
      //   console.log(err)
      // })

      let browsingResult = await initializeBrowsing(0)

      resolve(browsingResult)

    })
    .then(async () => {

      await _chromeless
            .click('#user-dropdown > div.DashUserDropdown.dropdown-menu.dropdown-menu--rightAlign.is-forceRight.is-autoCentered > ul > li#signout-button.js-signout-button > button.dropdown-link')

      await _autoRegistration.startRegistration()

      _username = _autoRegistration.email
      _password = _autoRegistration.password

      await startLogin()

    })
    .catch((err) => {
      console.log(err)
    })

}

function initializeBrowsing(index) {
    console.log(_keywords)
    _trendTopicId = _keywords[index].id
    _trendTopic = '#' + _keywords[index].keyword

    return new Promise(async (resolve, reject) => {

      console.log('Initialize browsing by this trending: ', _trendTopic)
      await _chromeless
      .wait(5000)
      .wait('#search-query')
      .evaluate(() => {
          document.querySelector('#search-query').value = ''
      })
      .type(_trendTopic, '#search-query')
      .wait(2000)
      .click('.Icon.Icon--medium.Icon--search.nav-search')
      .wait('#timeline')
      .then(async () => {

        if (_keywords[index].is_used > 0 && _keywords[index].successful_comment > 0) {
          resolve(true)
        } else {

          let result = await processCommenting(0)

          console.log('Comment count: ', _commentCount)
          console.log('Success Comment count: ', _successCommentCount)
          console.log('Unsuccess Comment count: ', _unsuccessCommentCount)

          UpdateKeywordStatus(_trendTopicId, _successCommentCount, _unsuccessCommentCount)

          resolve(result)

        }

      })
      .catch((err) => {
        console.log(err)
        resolve(false)
      })

    })
    .then((result) => {

      _commentCount = 0
      _successCommentCount = 0
      _unsuccessCommentCount = 0

      if (result) {

        if (_totalCommentCount == _maxTotalCommentCount) {
          console.log('change account. total comment count:' + _totalCommentCount)
          return true
        }

        if (index < _keywordsCount) {
          return initializeBrowsing(index + 1)
        } else {
          console.log('Finish commenting with all the keywords.')
          return true
        }

      } else {
        return true
      }

    }).catch((err) => {
      console.log(err)
      reject(err)
    })

}

var processCommenting = (index) => {

    return new Promise(async (resolve, reject) => {

      await _chromeless
      .wait(3000)
      .wait('div.Grid-cell.u-size2of2.u-lg-size2of3')
      .evaluate((index) => {
        return (document.querySelector(".js-stream-item.stream-item.stream-item:nth-child(" + (index + 1) + ") .ProfileTweet-actionList.js-actions .ProfileTweet-actionButton.js-actionButton.js-actionReply") == null) && (document.querySelectorAll("div.ProfileCard.js-actionable-user.ProfileCard--wide").length > 0)
      }, index)
      .then((result) => {

        if (result) {
          index += 1
        }

      })
      .catch((err) => {
        console.log(err)
        reject(err)
      })

      console.log('index: ' + index)

      await _chromeless
      .evaluate((index) => {

        console.log('index: ' + index)

        return (document.querySelectorAll(".stream-item-footer").length > 0) && (document.querySelectorAll(".stream-item-footer")[index] != null)

      }, index)
      .then(async (result) => {

        if (!result) {
          resolve(false)
        } else {

          await _chromeless
          .evaluate((index) => {

            document.querySelectorAll('div.tweet.js-stream-tweet.js-actionable-tweet.js-profile-popup-actionable.dismissible-content.original-tweet.js-original-tweet')[index].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})

            let result = document.querySelectorAll(".stream-item-footer")[index].querySelector(".ProfileTweet-actionList.js-actions .ProfileTweet-actionButton.js-actionButton.js-actionRetweet span span").innerHTML

            if (result == "") {
              return 0
            } else {

              if (result.endsWith("K")) {
                return parseInt(result) * 1000
              } else if (result.endsWith("M")) {
                return parseInt(result) * 1000000
              } else {
                return parseInt(result)
              }

            }

          }, index)
          .then(async (retweetCount) => {

            console.log('retweetCount: ' + retweetCount)

            if (retweetCount >= _retweetCount) {
              _commentCount += 1

              console.log("retweet count: " + retweetCount, "Loop: " + index)

              await _chromeless
              .wait(5000)
              .click(".js-stream-item.stream-item.stream-item:nth-child(" + (index + 1) + ") .ProfileTweet-actionList.js-actions .ProfileTweet-actionButton.js-actionButton.js-actionReply")
              // .upload(".t1-label input[name=media_empty]", _photo)
              .wait(5000)
              .evaluate((commentMessage) => {
                document.querySelector("#tweet-box-global").innerHTML = commentMessage.replace(/\n{2,}/g, "</p><br/><p>").replace(/\n/g, "<br/>")
              }, _commentMessage)
              .wait(10000)
              .click(".TweetBoxToolbar-tweetButton.tweet-button button:nth-child(2)")
              .wait(8000)
              .then(() => {

                _successCommentCount += 1
                _totalCommentCount += 1

                socket.emit('updateLoggedUserInfo', {
                  username: _username,
                  password: _password,
                  totalComment: _totalCommentCount
                })

                resolve(true)

              })
              .catch((err) => {
                _unsuccessCommentCount += 1
                console.log(err)
                resolve(true)
              })

          } else {
            resolve(true)
          }

          })
          .catch((err) => {
            console.log(err)
            resolve(false)
          })

        }

      })

    })
    .then((result) => {
      console.log('result ' ,result)
      if (result) {

        UpdateKeywordStatus(_trendTopicId, _successCommentCount, _unsuccessCommentCount)

        if (_commentCount == _maxCommentCount || index == 200 || _totalCommentCount == _maxTotalCommentCount) {
          return true
        } else {
          console.log('recurse')
          return processCommenting(index + 1)
        }

      } else {
        return true
      }

    })

}

module.exports = router
