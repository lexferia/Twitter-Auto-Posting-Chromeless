var _chromeless

function AutoRegistration (chromeless) {
  _chromeless = chromeless
}

AutoRegistration.prototype.fullEmail = function (domain = 'gmail.com') {
    return this.email + '@' + domain
}

AutoRegistration.prototype.getRandomString = function (length) {

    var text = ""
    var possible = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890"

    for(var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
}

AutoRegistration.prototype.proceed = function () {

  return new Promise(async (resolve, reject) => {
    await _chromeless
    .click('a.skip-link')
    .wait(3000)  //skip all the links
    .click('#phx-signup-form > div.textbox > div.prompt.select-username > div.suggestions > ul > li:nth-child(1) > button')
    .wait(3000)
    .click('a.skip-link')
    .wait(3000) //skip all the links
    .click('#page-container > div.content-main > div > div > div > div.Grid-cell.u-size4of10.StartCongratulations-leftCol > div > a')
    .wait(3000)  //skip all the links
    .click('#page-container > div.StartPageLayout.content-main > div > div > div.Grid-cell.u-size4of12 > div > div > button')
    .wait(3000) //skip all the links
    .click('#page-container > div.StartPageLayout.content-main > div > div > div.Grid-cell.u-size4of12 > div > div > a')
    .wait(5000)  //gmail no thanks
    .click('button.btn-follow-all')
    .wait(5000) //follow button
    .click('#push-notification-dialog-dialog > div:nth-child(6) > button')
    .wait(5000)
    .click('button.UIWalkthrough-skip')

    resolve(true)
  })
  .then((result) => {
    return result
  })

}

AutoRegistration.prototype.createAccount = function () {

  return new Promise(async (resolve, reject) => {

    this.fullname = this.getRandomString(10)
    this.email = "twt_" + this.getRandomString(11)
    this.password = "qwas1357**"

    await _chromeless
    .goto('https://twitter.com/signup')
    .wait(5000)
    .evaluate(() => {
      document.querySelector('#full-name').value = ''
      document.querySelector('#email').value = ''
      document.querySelector('#password').value = ''
    })
    .type(this.fullname, '#full-name')
    .wait(5000)
    .type(this.email + "@gmail.com", '#email')
    .wait(5000)
    .type(this.password, '#password')
    .wait(15000)
    .click('#submit_button')
    .wait(10000)
    .exists('#sms-phone-create-form > div.doit > div.links > a')
    .then(async (result) => {
        console.log(result)
        if (result) {

          let proceedResult = await this.proceed()

          resolve(proceedResult)

        } else {
          resolve(false)
        }
    })
    .catch((error) => {
      _chromeless
      .end()
      resolve(false)
    })
  })
  .then(async (result) => {
    console.log('fullname: ' + this.fullname)
    console.log('username: ' + this.fullEmail())
    console.log('password: ' + this.password)
    console.log('this is the login result: ' + result)
    if (!result) {

      console.log('logging out account. ')

      await _chromeless
      .click('div.Dropdown-menuContainer > div.Dropdown-menu.Dropdown--right > ul > li.js-logoutLink > button')
      .catch((error) => {
        console.log('Test: ' + error)
      })

      console.log('entering create account. ')

      return this.createAccount()

    } else {
      console.log('ended.')
      return result
    }

  })

}

AutoRegistration.prototype.startRegistration = function () {

  return new Promise(async (resolve, reject) => {
    await _chromeless
    .goto('https://api.ipify.org/?format=json')
    .wait(5000)
    .evaluate(() => {
        return JSON.parse(document.body.innerText)
    })
    .then(async (result) => {
        console.log(result.ip)
        let createAccountResult = await this.createAccount()

        resolve(createAccountResult)

    })
    .catch((error) => {
      console.error('Search failed:', error)
      return startRegistration()
    })

  })
  .then((result) => {
    return result
  })

}

module.exports = AutoRegistration
