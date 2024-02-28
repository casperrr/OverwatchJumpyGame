const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 800;

class Game{
    constructor(){
        this.score = 0;
        let storedHighScore = localStorage.getItem('highScore'); 
        this.highScore = storedHighScore == null?0:storedHighScore;
        this.nPlat = 15;
        this.platforms = [];
        this.player;
        this.playerColor = '#FF00AA';
        this.platSpacing = [70,50];
        this.gameState = 'playing' // playing, death, deathScreen
        // this.input = new InputHandler();
        this.platUnderPlayer = 4;
        
        document.addEventListener('keydown', event => {
            if (event.code === 'Space'){
                console.log('Space Pressed');
                this.handleSpace();
            }else if(event.which == 17){
                console.log('Ctrl Presssed');
                this.handleCtrl();
            }
        });
    }

    init(){
        //make platforms
        this.platforms = [];
        for(let i = 0; i < this.nPlat; i++){
            if(i < this.platUnderPlayer){
                this.platforms.push(null);
            }else{
                this.addPlatform(i);
            }
        }
        this.score = 0;
        this.player = new Player();
        this.gameState = 'playing';
    }

    run(){
        switch(this.gameState){
            case 'playing':
                this.draw();
                break
            case 'death':
                this.death();
                break
            case 'deathScreen':
                this.deathScreen();
                break
        }
    }

    draw(){
        bg();
        // draw ball
        this.player.draw();
        // Draw Stairs
        this.drawStairs();
        // Draw Score
        this.drawScore();
    }

    drawStairs(){
        this.platforms.forEach((p,i) => {
            if(p != null){
                p.draw(
                    (canvas.width/2)+(this.platSpacing[0]*(p.num-this.player.position[0])),
                    600+(this.platSpacing[1]*(-i+this.player.position[1]+this.platUnderPlayer)));   
            }
        });
    }

    drawScore(){
        let x = canvas.width/2;
        let y = 100;
        // Score
        c.font = '25px sans-serif';
        c.textAlign = "center";
        c.fillStyle = this.score > this.highScore?'#ff7777':'#ffffff';
        c.fillText(`Score:`, 100, y);
        c.fillText(`${this.score}`, 100, y+30);
        // High Score
        c.fillStyle = '#ffffff';
        c.fillText("High Score:", canvas.width-100, y);
        c.fillText(`${this.highScore}`, canvas.width-100,y+30);
    }

    addPlatform(i){
        let lr = randomOneOrMinusOne();
        this.platforms.push(new Platform(lr, i<this.platUnderPlayer+1?0:this.platforms[i-1].num+lr));
    }

    handleSpace(){
        if(this.gameState == 'playing'){
            this.player.position[0] = this.player.position[0]+this.player.direction;
            // this.player.position[1]++;
            this.platforms.shift();
            this.addPlatform(this.nPlat-1);
            this.checkDeath();
        }else if(this.gameState == 'deathScreen'){
            if(this.score > this.highScore){
                this.highScore = this.score;
            }
            this.init();
        }else{

        }
    }
    handleCtrl(){
        this.player.direction *= -1;
        this.handleSpace();
    }
    
    checkDeath(){
        if(this.player.position[0]!=this.platforms[this.platUnderPlayer].num){
            console.log('dead!');
            this.gameState = 'death';
            console.log('game over!');
        }else{
            console.log('alive!');
            this.score++;
        }
    }

    death(){
        // Animate death
        bg();
        this.player.deathAnimation(this);
        // this.player.actualPos[0] += 0.1;
        // this.player.draw();
        this.draw();
    }

    deathScreen(){
        bg();
        c.fillStyle = '#ffffff';
        c.font = '40px sans-serif';
        c.fillText("Game Over!", canvas.width/2, 200);
        c.font = '28px sans-serif';
        c.fillText(`Score:`, canvas.width/2, 300);
        c.fillText(`${this.score}`, canvas.width/2, 340);
        if(this.score > this.highScore){
            // this.highScore = this.score;
            localStorage.setItem('highScore', this.score);
            c.fillText("New High Score!:", canvas.width/2, 400);
            c.fillText(`${this.score}`, canvas.width/2, 440);
        }else{
            c.fillText("High Score:", canvas.width/2, 400);
            c.fillText(`${this.highScore}`, canvas.width/2, 440);
        }
        c.fillText("Press Space to Try Again", canvas.width/2, 600);
    }

}

class Platform{
    constructor(lr, num){
        // this.lr = lr == 1? 1 : -1;
        this.lr = lr;
        this.num = num;
        this.size = [50,5];
        this.color = '#f0f0f0';
    }

    draw(x,y){
        c.fillStyle = this.color;
        c.fillRect(x-(this.size[0]/2), y, this.size[0], this.size[1]);
    }
}

class Player{
    constructor(){
        this.color = '#FF00AA';
        this.rad = 20;
        this.position = [0,0];
        this.actualPos = [400,600];
        this.direction = -1;
        this.speed = 0;
    }

    draw(){
        let eyePos = [this.actualPos[0],this.actualPos[1]-this.rad];
        let eyeOffSet = [this.rad/2*this.direction,-this.rad/3];
        c.fillStyle = this.color;
        c.beginPath();
        c.ellipse(this.actualPos[0],this.actualPos[1]-(this.rad), this.rad,this.rad,0,0,2*Math.PI);
        c.fill();
        //draw eyes
        c.fillStyle = '#000000';
        c.beginPath();
        c.ellipse(eyePos[0]+eyeOffSet[0],eyePos[1]+eyeOffSet[1], 5, 5, 0,0,Math.PI*2);
        c.fill();
        c.fillStyle = '#eeeeee';
        c.beginPath();
        c.ellipse(eyePos[0]+eyeOffSet[0]+this.direction,eyePos[1]+eyeOffSet[1]-1, 1, 1, 0,0,Math.PI*2);
        c.fill();
        

    }

    deathAnimation(game){
        if(this.actualPos[1] < canvas.height+(this.rad*2)){
            bg();
            this.speed += 0.05;
            this.actualPos[1] += this.speed;
        }else{
            game.gameState = 'deathScreen';
        }
    }


}

class InputHandler{
    constructor(){
        this.keys = [];
        window.addEventListener('keydown', e => {
            if ((   e.key === 'Space' ||
                    e.key === 'Control' ||
                    e.key === 'ArrowRight'
                )&& this.keys.indexOf(e.key)=== -1){
                    this.keys.push(e.key);
                }
            console.log(e.key, this.keys);
        });
    }
}

function random(a,b){
    return Math.floor(Math.random()*(b-a)+a);
}

function randomOneOrMinusOne() {
    return Math.random() < 0.5 ? -1 : 1;
}
  
function bg(){
    c.fillStyle = '#181818';
    c.fillRect(0,0,canvas.width,canvas.height);

}

function loop(){
    main.run();
    requestAnimationFrame(loop);
}

let main = new Game();
main.init();
loop();