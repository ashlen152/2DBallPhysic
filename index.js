const WIDTH = 600;
const HEIGHT = 600;
const NUMBER_OF_BALLS = 200
const MU = 0.01
let MOUSE_X = 0;
let MOUSE_Y = 0;
let MOUSE_PRESSED = false
const ROOT = document.getElementById('root')
var fps, fpsInterval, startTime, now, then, elapsed

const random = (min, max) => {
	return Math.random() * (max - min) + min;
}

const setup = () => {
	const canvas = document.createElement('canvas')
	canvas.setAttribute('width', WIDTH)
	canvas.setAttribute('height', HEIGHT)

	ROOT.appendChild(canvas)
	canvas.addEventListener('mousemove', (ev) => {
		MOUSE_X = ev.clientX - canvas.offsetLeft;
		MOUSE_Y = ev.clientY - canvas.offsetTop;
	})

	canvas.addEventListener('mousedown', (ev) => {
		MOUSE_X = ev.clientX - canvas.offsetLeft;
		MOUSE_Y = ev.clientY - canvas.offsetTop;

		MOUSE_PRESSED = true
	})

	canvas.addEventListener('mouseup', (ev) => {
		MOUSE_PRESSED = false

	})

	return canvas
}

const canvas = setup();
const ctx = canvas.getContext('2d');
const balls = []

class PushField {
	constructor(x, y, radius, strength) {
		this.pos = new Vector(x, y)
		this.str = strength
		this.radius = radius
	}

	checkInField(ball) {
		const { pos, radius } = ball
		const dx = pos.x - this.pos.x
		const dy = pos.y - this.pos.y
		const distance = new Vector(dx, dy).magnitude()

		const dir = new Vector(dx, dy).normalize().mult(-1)

		if (dx * dx + dy * dy < this.radius * this.radius) {
			ctx.beginPath();
			ctx.moveTo(pos.x, pos.y);
			ctx.lineTo((pos.x + dir.x * 10), (pos.y + dir.y * 10));
			ctx.strokeStyle = "green"
			ctx.stroke();

			const strength = this.str - (distance / this.radius * this.str)
			ball.applyForce(dir.mult(-strength))
			return true
		}
		return false
	}

	updatePosition(pos) {
		this.pos = pos
	}

	show() {
		ctx.beginPath();
		ctx.strokeStyle = "#FFFFFF";
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
	}
}


class Vector {
	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	add(vector) {
		this.x += vector.x
		this.y += vector.y
		return this
	}

	mult(number) {
		this.x *= number
		this.y *= number
		return this
	}

	limit(number) {
		if (this.x > number)
			this.x = number
		if (this.y > number)
			this.y = number
		return this
	}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	normalize() {
		const len = this.magnitude()
		if (len !== 0) this.mult(1 / len);
		return this
	}

	div(n) {
		this.x /= n
		this.y /= n
		return this
	}

	copy() { return new Vector(this.x, this.y) }

	setMag(n) {
		this.normalize()
		this.mult(n)
		return this
	}
}

class Ball {
	constructor(m, x, y, color) {
		this.pos = new Vector(x, y)
		this.color = color;
		this.vel = new Vector()
		this.acc = new Vector()
		this.mass = m
		this.radius = Math.sqrt(this.mass) * 10
	}

	applyForce(force) {
		const f = force.copy()
		f.div(this.mass)
		this.acc.add(force)
	}


	friction() {
		// // Direction of Friction
		let friction = this.vel.copy();
		friction.normalize();
		friction.mult(-1);

		// // Magnitude of Friction
		let normal = this.mass;
		friction.mult(MU * normal)

		this.applyForce(friction);

	}

	update() {
		this.vel.add(this.acc)
		this.pos.add(this.vel)
		this.acc.mult(0)
		this.vel.limit(4)
	}

	show() {
		if (pushField.checkInField(this))
			ctx.strokeStyle = "#FF00FF"
		else
			ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
		ctx.stroke();

	}
}

const findBallInPosition = (ball) => {
	const { pos, radius } = ball
	const dx = MOUSE_X - pos.x
	const dy = MOUSE_Y - pos.y

	if (dx * dx + dy * dy < radius * radius)
		return true
	return false
}

const createBall = () => {
	const x = Math.random() * WIDTH
	const y = Math.random() * HEIGHT
	const force = new Vector(random(-2, 2), random(-2, 2))
	const mass = random(1, 3)
	const color = '#FF0000'
	const ball = new Ball(mass, x, y, color)
	ball.applyForce(force)
	return ball
}

const generateBall = (number) => {
	for (let i = 0; i < number; i++) {
		balls.push(createBall())
	}
}

const clear = () => {
	ctx.clearRect(0, 0, WIDTH, HEIGHT)
}

const showMouse = () => {
	ctx.beginPath()
	ctx.strokeStyle = "#FFFFFF";
	ctx.arc(MOUSE_X, MOUSE_Y, 2, 0, 2 * Math.PI);
	ctx.stroke();
}

const pushField = new PushField(300, 300, 100, 0.5)

const draw = () => {


	// calc elapsed time since last loop

	now = Date.now();
	elapsed = now - then;

	// if enough time has elapsed, draw the next frame

	if (elapsed > fpsInterval) {

		// Get ready for next frame by setting then=now, but also adjust for your
		// specified fpsInterval not being a multiple of RAF's interval (16.7ms)
		then = now - (elapsed % fpsInterval);

		clear()
		showMouse()

		pushField.updatePosition(new Vector(MOUSE_X, MOUSE_Y))
		pushField.show()

		for (const ball of balls) {
			ball.friction()
			ball.update()
			ball.show()
		}


	}

	window.requestAnimationFrame(draw)
}

const startAnimating = (fps) => {
	fpsInterval = 1000 / fps;
	then = Date.now();
	startTime = then;
	draw();
}

generateBall(NUMBER_OF_BALLS)
startAnimating(60)

