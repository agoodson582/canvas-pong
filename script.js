window.addEventListener('load', () => {

    // Asset load
    const ballImg = document.getElementById('ball')
    const gameStart = new Audio('assets/game_start.mp3')
    const paddleHit = new Audio('assets/paddle_hit.mp3')
    paddleHit.addEventListener('play', _ => {
        setTimeout(() => {paddleHit.pause()}, 0.3 * 1000)
    })
    const paddleHitStamps = [4.03, 7.82, 11.71]
    const wallHit = new Audio('assets/wall_hit.mp3')
    const gotPoint = new Audio('assets/got_point.mp3')
    gotPoint.volume = 0.04
    const shatter = new Audio('assets/shatter.mp3')
    shatter.volume = 0.2
    const respawn = new Audio('assets/respawn.mp3')
    respawn.volume = 0.5
    respawn.addEventListener('play', _ => {
        setTimeout(() => {
            respawn.pause()
            respawn.currentTime = 0
        }, 2 * 1000)
    })
    const gameOver = new Audio('assets/game_over.mp3')

    class InputListener {
        constructor(game) {
            this.game = game
            
            window.addEventListener('keydown', event => {
                if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight')
                && !this.game.keyEvents.includes(event.key)) {
                    this.game.keyEvents.push(event.key)
                }
            })

            window.addEventListener('keyup', event => {
                if (this.game.keyEvents.includes(event.key)) {
                    this.game.keyEvents.splice(this.game.keyEvents.indexOf(event.key), 1)
                }
            })
        }
    }

    class Ball {
        constructor(game, image, speed = {x: 10, y: 8}) {
            this.game = game
            this.image = image
            this.speed = speed
            this.originalSpeed = Object.assign({}, speed)
            this.size = {x: 30, y: 30}
            this.position = {x: this.calcXPosition(), y: 10}
            this.speed.x *= this.randomDirection()
            this.in = true
        }

        update() {
            this.position = updatePosition(this.position, this.speed)
            // Ball bounces off either wall
            if (this.position.x < 0 || this.position.x > this.game.size.x - this.size.x) {
                this.speed.x *= -1
                wallHit.currentTime = 0.46
                if (this.in) wallHit.play()
            }

            // Ball bounces off ceiling
            if (this.position.y < 0) {
                this.speed.y *= -1
                this.game.score++
                gotPoint.play()
            }

            // Ball bounces off top of paddle
            if (this.game.checkCollision(this, this.game.paddle)
            && this.position.y < this.game.size.y - this.game.paddle.size.y - 30) {
                let randomizer = Math.random()
                switch (true) {
                    case randomizer < 0.33:
                        paddleHit.currentTime = paddleHitStamps[0]
                        break
                    case randomizer < 0.66:
                        paddleHit.currentTime = paddleHitStamps[1]
                        break
                    default:
                        paddleHit.currentTime = paddleHitStamps[paddleHitStamps.length - 1]
                        break
                }
                this.speed.y *= -1
                paddleHit.play()
            }

            // Ball goes past bottom of window
            if (this.position.y > this.game.size.y && this.in){
                this.game.paddle.subtractLife()
                shatter.play()
                if (this.game.paddle.lives <= 0) {
                    this.game.over = true
                    return
                }
                setTimeout(() => {respawn.play()}, 1000)
                let timeoutID = setTimeout(this.respawn.bind(this), 2000)
                timeoutIDs.push(timeoutID)
                this.in = false
            }
        }

        draw(context) {
            context.fillStyle = 'black'
            this.image ? context.drawImage(this.image, this.position.x, this.position.y, this.size.x, this.size.y)
            : context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
        }

        randomDirection() {
            return Math.random() > 0.5 ? 1 : -1
        }

        calcXPosition() {
            return Math.random() * (this.game.size.x - this.size.x - 20) + 10
        }

        respawn() {
            this.position = {x: this.calcXPosition(), y: 10}
            this.speed = {x: 0, y: 0}
            this.in = true
            let timeoutID = setTimeout(() => {
                this.speed.x = this.originalSpeed.x * this.randomDirection()
                this.speed.y = this.originalSpeed.y
            }, 1 * 1000);
            timeoutIDs.push(timeoutID)
        }
    }

    class Paddle {
        constructor(game, position) {
            this.game = game
            this.size = {x: 160, y: 30}
            this.position = position ?? {x: this.game.size.x/2 - this.size.x/2, y: this.game.size.y - this.size.y - 30}
            this.speedX = 0
            this.maxSpeed = 15
            this.lives = 3
            this.color = 'green'
        }

        update() {
            if (this.game.keyEvents.includes('ArrowLeft')) this.speedX = -this.maxSpeed
            else if (this.game.keyEvents.includes('ArrowRight')) this.speedX = this.maxSpeed
            else this.speedX = 0
            this.position.x += this.speedX

            if (this.position.x < 0) this.position.x = 0
            if (this.position.x > this.game.size.x - this.size.x) this.position.x = this.game.size.x - this.size.x
        }

        draw(context) {
            context.fillStyle = this.color
            context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
        }
        
        subtractLife() {
            this.lives--
        }
    }

    class UI {
        constructor(game) {
            this.game = game
            this.fontSize = 25
            this.fontFamily = 'Arial'
            this.color = 'black'
        }

        draw(context) {
            context.save()

            context.fillStyle = this.color
            // TODO? Consider adding shadows
            context.font = `${this.fontSize}px ${this.fontFamily}`

            // Score
            context.textAlign = 'left'
            context.fillText('Score: ' + this.game.score, 12, 30)

            // Lives
            context.textAlign = 'right'
            context.fillText('Lives: ' + this.game.paddle.lives, this.game.size.x - 12, 30)

            context.restore()
        }

        drawSplashScreen(context) {
            context.fillStyle = this.color
            context.font = `${this.fontSize * 3}px ${this.fontFamily}`
            context.textAlign = 'center'

            context.fillText('PONG MARATHON', this.game.size.x/2, this.game.size.y * 0.45)

            context.font = `${this.fontSize * 1.5}px ${this.fontFamily}`
            context.fillText('Select "New Game" below to start!', this.game.size.x/2, this.game.size.y * 0.6)
        }

        drawGameOver(context) {
            context.fillStyle = this.color
            context.font = `${this.fontSize * 2.5}px ${this.fontFamily}`
            context.textAlign = 'center'

            context.fillText('GAME OVER', this.game.size.x/2, this.game.size.y/2)
            
            context.font = `${this.fontSize * 1.5}px ${this.fontFamily}`
            context.fillText('Better luck next time!', this.game.size.x/2, this.game.size.y * 0.6)
        }
    }

    class Game {
        constructor(size) {
            this.size = size
            this.ui = new UI(this)
            this.keyEvents = []
        }

        setup() {
            this.ball = new Ball(this, ballImg)
            this.paddle = new Paddle(this)
            this.inputListener = new InputListener(this)
            this.score = 0
            this.over = false
            gameStart.currentTime = 0
            gameStart.play()
        }

        update() {
            this.ball.update()
            this.paddle.update()
        }

        draw(context) {
            this.ball.draw(context)
            this.paddle.draw(context)
            this.ui.draw(context)
        }

        checkCollision(rect1, rect2) {
            return (
                rect1.position.x < rect2.position.x + rect2.size.x &&
                rect1.position.x + rect1.size.x > rect2.position.x &&
                rect1.position.y + rect1.size.y > rect2.position.y &&
                rect1.position.y + rect1.size.y - rect2.position.y <= 5
            )
        }

        end(context) {
            this.draw(context)
            this.ui.drawGameOver(context)
            let timeoutID = setTimeout(() => {gameOver.play()}, 0.8 * 1000)
            timeoutIDs.push(timeoutID)
        }
    }

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime // Also known as frame time
        lastTime = timeStamp
        cContext.clearRect(0, 0, canvas.width, canvas.height)
        if (!game.over) game.update()
        else {
            game.end(cContext)
            return
        }
        game.draw(cContext)
        animateRequestID = requestAnimationFrame(animate)
    }

    function updatePosition(position, speed) {
        return {x: position.x + speed.x, y: position.y + speed.y}
    }

    function setupGame(context) {
        if (animateRequestID)  cancelAnimationFrame(animateRequestID)
        timeoutIDs.forEach(id => clearTimeout(id))
        timeoutIDs = []

        game.setup()
        cContext.clearRect(0, 0, canvas.width, canvas.height)
        game.draw(context)
    
        let timeoutID = setTimeout(() => {
            animate()
        }, 2 * 1000);
        timeoutIDs.push(timeoutID)
    }

    // Canvas setup
    const canvas = document.getElementsByTagName('canvas')[0]
    const cContext = canvas.getContext('2d')

    canvas.width = 1280
    canvas.height = 720
    
    const game = new Game({x: canvas.width, y: canvas.height})
    game.ui.drawSplashScreen(cContext)
    let timeoutIDs = []
    let animateRequestID
    let lastTime = 0

    document.getElementById('new-game').addEventListener('click', () => setupGame(cContext))    
})