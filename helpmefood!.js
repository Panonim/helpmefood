// Importowanie wymaganych modułów
const readline = require('readline')
const { exit } = require('process')
const tty = require('tty')

// Włączenie obsługi zdarzeń klawiszy dla strumienia wejściowego
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

// Ustalanie szerokości i wysokości planszy gry
let width = process.stdout.columns
let height = process.stdout.rows - 2

// Inicjalizacja gracza na środku planszy
let player = { x: Math.floor(width / 2), y: Math.floor(height / 2) }

// Inicjalizacja głównej węża
let mainSnake = [{ x: 0, y: 0 }]

// Inicjalizacja zielonych węży
let greenSnakes = []
for (let i = 0; i < 3; i++) {
   greenSnakes.push({
       x: Math.floor(Math.random() * width),
       y: Math.floor(Math.random() * height),
       length: 3,
   })
}

// Inicjalizacja kierunku ruchu
let direction = { x: 0, y: 0 }

// Inicjalizacja stanu gry
let gameOver = false
let points = 0
let snakeMoveCounter = 0
let messageDisplayed = false

// Funkcja rysująca stan gry
const draw = () => {
   console.clear()
   for (let y = 0; y < height; y++) {
       let line = ''
       for (let x = 0; x < width; x++) {
           if (x === player.x && y === player.y) {
               line += '\x1b[94mP\x1b[0m'
           } else if (
               mainSnake.some((segment) => segment.x === x && segment.y === y)
           ) {
               line += '\x1b[91mS\x1b[0m'
           } else if (
               greenSnakes.some(
                   (snake) => x >= snake.x && x < snake.x + 3 && y === snake.y
               )
           ) {
               line += '\x1b[32mSSS\x1b[0m'
               x += 2
           } else {
               line += ' '
           }
       }
       console.log(line)
   }
   console.log(`Punkty: ${points}`)
}

// Funkcja przesuwająca węża
const moveSnake = (snake, targetX, targetY) => {
   const head = { ...snake[0] }
   const dx = targetX - head.x
   const dy = targetY - head.y
   head.x += dx !== 0 ? Math.sign(dx) : 0
   head.y += dy !== 0 ? Math.sign(dy) : 0
   snake.unshift(head)
   while (snake.length > 8) snake.pop()
   return head
}

// Funkcja przesuwająca zielone węże
const moveGreenSnakes = () => {
   greenSnakes.forEach((snake) => {
       const dx =
           Math.random() > 0.5
               ? Math.random() > 0.5
                   ? Math.sign(Math.random() * 3 - 1)
                   : 0
               : Math.sign(mainSnake[0].x - snake.x)
       const dy =
           Math.random() > 0.5
               ? Math.random() > 0.5
                   ? Math.sign(Math.random() * 3 - 1)
                   : 0
               : Math.sign(mainSnake[0].y - snake.y)
       const newX = snake.x + dx
       const newY = snake.y + dy
       if (
           newX >= 0 &&
           newX < width &&
           newY >= 0 &&
           newY < height &&
           !mainSnake.some(
               (segment) => segment.x === newX && segment.y === newY
           ) &&
           !greenSnakes.some((green) => green.x === newX && green.y === newY)
       ) {
           snake.x = newX
           snake.y = newY
       }
   })
}

// Główna pętla gry
const gameLoop = () => {
   if (gameOver) {
       if (!messageDisplayed) {
           console.log(
               points >= 20
                   ? 'Wygrałeś! Naciśnij dowolny klawisz, aby wyjść.'
                   : 'Koniec gry! Naciśnij dowolny klawisz, aby wyjść.'
           )
           messageDisplayed = true
           process.stdin.once('keypress', () => exit())
       }
       return
   }
   player.x += direction.x
   player.y += direction.y
   if (player.x < 0) player.x = 0
   if (player.x >= width) player.x = width - 1
   if (player.y < 0) player.y = 0
   if (player.y >= height) player.y = height - 1
   if (points < 20) {
       if (snakeMoveCounter % 2 === 0) {
           moveSnake(mainSnake, player.x, player.y)
           moveGreenSnakes()
       }
   }
   if (
       mainSnake.some(
           (segment) => segment.x === player.x && segment.y === player.y
       )
   ) {
       gameOver = true
   }
   greenSnakes.forEach((snake, index) => {
       if (snake.x === player.x && snake.y === player.y) {
           points++
           snake.length += 2
           const newX = Math.floor(Math.random() * width)
           const newY = Math.floor(Math.random() * height)
           snake.x = newX
           snake.y = newY
       }
   })
   if (points >= 20) {
       gameOver = true
   }
   snakeMoveCounter++
   draw()
}

// Obsługa zdarzeń klawiszy
process.stdin.on('keypress', (str, key) => {
   if (key.ctrl && key.name === 'c') {
       exit()
   } else {
       switch (key.name) {
           case 'w':
               direction = { x: 0, y: -1 }
               break
           case 's':
               direction = { x: 0, y: 1 }
               break
           case 'a':
               direction = { x: -1, y: 0 }
               break
           case 'd':
               direction = { x: 1, y: 0 }
               break
       }
   }
})

// Uruchomienie gry
setInterval(gameLoop, 200)
draw()
