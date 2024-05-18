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

// Ustalanie długości zielonych węży
const greenSnakeLength = 3

// Inicjalizacja zielonych węży
let greenSnakes = []
const spawnGreenSnake = () => {
    return {
        body: Array.from({ length: greenSnakeLength }, () => ({
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
        }))
    }
}

for (let i = 0; i < 3; i++) {
   greenSnakes.push(spawnGreenSnake())
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
           } else {
               let snakeSegmentFound = false
               for (let snake of greenSnakes) {
                   if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                       line += '\x1b[32mS\x1b[0m'
                       snakeSegmentFound = true
                       break
                   }
               }
               if (!snakeSegmentFound) {
                   line += ' '
               }
           }
       }
       console.log(line)
   }
   console.log(`Punkty: ${points}`)
}

// Funkcja przesuwająca węża
const moveSnake = (snake, targetX, targetY, length = 8) => {
   const head = { ...snake[0] }
   const dx = targetX - head.x
   const dy = targetY - head.y
   head.x += dx !== 0 ? Math.sign(dx) : 0
   head.y += dy !== 0 ? Math.sign(dy) : 0
   snake.unshift(head)
   while (snake.length > length) snake.pop()
   return head
}

// Funkcja przesuwająca zielone węże w losowych kierunkach
const moveGreenSnakes = () => {
   greenSnakes.forEach((snake) => {
       const head = snake.body[0]
       const dx = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
       const dy = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
       const newHead = {
           x: Math.min(Math.max(head.x + dx, 0), width - 1), // Upewnienie się, że pozycja pozostaje w szerokości
           y: Math.min(Math.max(head.y + dy, 0), height - 1) // Upewnienie się, że pozycja pozostaje w wysokości
       }
       snake.body.unshift(newHead)
       while (snake.body.length > greenSnakeLength) {
           snake.body.pop()
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
       const hitSegment = snake.body.find(segment => segment.x === player.x && segment.y === player.y)
       if (hitSegment) {
           points += 1 // Przyznaj tylko jeden punkt
           greenSnakes.splice(index, 1)
           greenSnakes.push(spawnGreenSnake()) // Wygeneruj nowego zielonego węża
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