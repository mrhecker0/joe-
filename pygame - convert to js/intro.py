from numpy import number
import pgzrun
import random
from pgzhelp import *
WIDTH = 144
HEIGHT = 256
dead = False
pipes = []
flappy_frames = ['bird_frame_1', 'bird_frame_2', 'bird_frame_3']
frame_counter = 0
menuscreen = True
score_var = 0
score_digits = ['0_score', '1_score', '2_score', '3_score', '4_score', '5_score', '6_score', '7_score', '8_score', '9_score']
score_upd = []
scored = False
# to do: add point system
# coins system and sound effects when we are done

# actors and positions
flappy = Actor('bird_frame_1')  
flappy.pos = (WIDTH // 2, HEIGHT // 2)
flappy.images = flappy_frames
pipe_down = Actor ('pipe_green_down')
pipe_down.pos = WIDTH, random.randint(-50, 0)
pipes.append(pipe_down)
pipe_up = Actor ('pipe_green_up')
pipe_up.pos = WIDTH, random.randint(HEIGHT - 50, HEIGHT)
pipes.append(pipe_up)
# game over sign
gameover = Actor('gameover')
gameover.pos = (WIDTH // 2, HEIGHT // 2)
#restart
restart = Actor('restart')
restart.pos = (WIDTH // 2, HEIGHT // 2 + 40)
# menu screen
gamelogo = Actor('flappylogo')
gamelogo.pos = (WIDTH // 2, HEIGHT //2 - 30)
# flappy bird rectangle for collision detection
flappy_rect = Rect((flappy.x - flappy.width // 2, flappy.y - flappy.height // 2), (flappy.width, flappy.height))
# update game state
def update():
    global dead
    global frame_counter
    global scored
    frame_counter += 1
    if frame_counter >= 13:
        frame_counter = 0
        flappy.next_image()
    if flappy.y < 0:
        dead = True
    flappy.y += 0.5  # gravity effect
    if flappy.y > HEIGHT:
        dead = True
    if flappy._rect.colliderect(pipe_down._rect) or flappy._rect.colliderect(pipe_up._rect):
        dead = True
    if pipe_up.right < flappy.left and not dead and not scored:
        scored = True
        global score_var
        score_var += 1
    elif dead or menuscreen:
        score_var = 0
    else:
        scored = False
    for pipe in pipes:
        pipe.x -= 1
        if pipe.right < 0:
            pipe.x = WIDTH
            if pipe.image == 'pipe_green_down':
                pipe.y = random.randint(-50, 0)
            else:
                pipe.y = random.randint(HEIGHT - 50, HEIGHT)


# handle up arrow, click, or space key pressed
def on_key_down(key):
    if key == keys.SPACE or key == keys.UP and not dead:
        flappy.y -= 20  # flap effect
        
def reset_game():
    flappy.pos = (WIDTH // 2, HEIGHT // 2)
def on_mouse_down(pos):
    global dead
    global menuscreen
    if not dead:
        flappy.y -= 20  # flap effect
    if restart.collidepoint(pos) and dead:
        dead = False
        reset_game()
    if restart.collidepoint(pos) and menuscreen:
        menuscreen = False
# draw items on the screen
def draw():
    screen.fill((255, 255, 255))
    screen.blit('backround_light', (0, 0))
    if menuscreen:
        gamelogo.draw()
        restart.draw()  
    elif not dead:
        flappy.draw()
        for pipe in pipes:
            pipe.draw()
        for digit in str(score_var):
            digit_int = int(digit)
            print(digit_int)
            score = Actor(score_digits[digit_int])
            score.pos = (WIDTH // 2 - (len(str(score_var)) * 10) + (str(score_var).index(digit) * 20), 20)
            score.draw()
    else:
        gameover.draw()
        restart.draw()
        




pgzrun.go()