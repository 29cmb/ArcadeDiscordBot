module.exports = (task, user) => {
    var file = require(`../responses/${task}.json`)
    var chosen = file[Math.floor(Math.random() * file.length)]
    chosen = chosen.replace("[username]", user.username)
    chosen = chosen.replace("[ping]", `<@${user.id}>`)
    
    return chosen
}