window.addEventListener('load', () => {

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
        constructor(game, image, speed = {x: 10, y: 8}, position = {x: 10, y: 10}) {
            this.game = game
            this.image = image
            this.speed = speed
            this.position = position
            this.size = {x: 30, y: 30}
            this.in = true
        }

        update() {
            this.position = updatePosition(this.position, this.speed)
            // Ball bounces off either wall
            if (this.position.x < 0 || this.position.x > this.game.size.x - this.size.x) {
                this.speed.x *= -1
            }

            // Ball bounces off ceiling
            if (this.position.y < 0) {
                this.speed.y *= -1
                this.game.score++
            }

            // Ball bounces off top of paddle
            if (this.game.checkCollision(this, this.game.paddle)
            && this.position.y < this.game.size.y - this.game.paddle.size.y - 30) {
                this.speed.y *= -1
            }

            // Ball goes past bottom of window
            if (this.position.y > this.game.size.y && this.in){
                this.game.paddle.subtractLife()
                if (this.game.paddle.lives <= 0) {
                    this.game.over = true
                    return
                }
                setTimeout(this.respawn.bind(this), 2000)
                this.in = false
            }
        }

        draw(context) {
            context.fillStyle = 'black'
            this.image ? context.drawImage(this.image, this.position.x, this.position.y, this.size.x, this.size.y)
            : context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
        }

        respawn() {
            this.position = {x: 10, y: 10}
            this.speed.x = 10
            this.in = true
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
            context.fillText('Score: ' + this.game.score, 12, 30)

            // Lives
            context.textAlign = 'right'
            context.fillText('Lives: ' + this.game.paddle.lives, this.game.size.x - 12, 30)

            context.restore()
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
            this.ball = new Ball(this, null)
            this.paddle = new Paddle(this)
            this.inputListener = new InputListener(this)
            this.keyEvents = []
            this.ui = new UI(this)
            this.score = 0
            this.over = false
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
                rect1.position.y < rect2.position.y + rect2.size.y &&
                rect1.position.y + rect1.size.y > rect2.position.y
            )
        }

        end(context) {
            this.draw(context)
            this.ui.drawGameOver(context)
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
        requestAnimationFrame(animate)
    }

    function updatePosition(position, speed) {
        return {x: position.x + speed.x, y: position.y + speed.y}
    }

    // Canvas setup
    const canvas = document.getElementsByTagName('canvas')[0]
    const cContext = canvas.getContext('2d')

    canvas.width = 1280
    canvas.height = 720

    // Game setup
    const game = new Game({x: canvas.width, y: canvas.height})
    let lastTime = 0

    animate()

})