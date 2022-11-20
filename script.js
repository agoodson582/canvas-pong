window.addEventListener('load', () => {

    class Ball {
        constructor(game, image, speed = {x: 8, y: 0}, position = {x: 10, y: 10}) {
            this.game = game
            this.image = image
            this.speed = speed // TODO: Update speed parameter
            this.position = position
            this.size = {x: 30, y: 30}
        }

        update() {
            this.position = updatePosition(this.position, this.speed)
            if (this.position.x < 0 || this.position.x > this.game.size.x - this.size.x) {
                this.speed.x *= -1
            }

            if (this.position.y < 0) this.speed.y *= -1
        }

        draw(context) {
            context.fillStyle = 'black'
            this.image ? context.drawImage(this.image, this.position.x, this.position.y, this.size.x, this.size.y)
            : context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
        }
    }

    class Paddle {
        constructor(game, position) {
            this.game = game
            this.size = {x: 100, y: 20}
            this.position = position ?? {x: this.game.size.x/2 - this.size.x/2, y: this.game.size.y - this.size.y - 15}
            this.speedX = 0
            this.maxSpeed = 3 // TODO? Update max speed
            this.color = 'green'
        }

        update() {
            this.position.x += this.speedX
        }

        draw(context) {
            context.fillStyle = this.color
            context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
        }
    }

    class Game {
        constructor(size) {
            this.size = size
            this.ball = new Ball(this, null)
            this.paddle = new Paddle(this)
        }

        update() {
            this.ball.update()
            this.paddle.update()
        }

        draw(context) {
            this.ball.draw(context)
            this.paddle.draw(context)
        }
    }

    function animate() {
        cContext.clearRect(0, 0, canvas.width, canvas.height)
        game.update()
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
    animate()

})