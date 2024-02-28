const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 800;

class Game{
    constructor(){
        this.score = 0;
        this.nPlat = 10;
        this.platforms = [];
        this.player;
        this.playerColor = '#FF00AA';
        this.platSpacing = [70,50];
        this.gameState = true // alive = true, dead = false
        
        
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
            this.addPlatform(i);
        }
        
        this.score = 0;
        this.player = new Player();
        this.gameState = true;
    }

    draw(){
        bg();
        // if(this.gameState){
            // draw ball
            this.player.draw();
            // Draw Stairs
            this.drawStairs();
            // Draw Score
            this.drawScore();
        // }else{
            // do death stuff
        //     console.log("made it here")
        //     if(this.player.actualPos[1] < canvas.height+(this.player.rad*2)){
        //         bg();
        //         // this.drawStairs();
        //         // this.player.draw();
        //         // this.player.speed += 0.01;
        //         // this.player.actualPos[1] += this.player.speed;
        //     }else{
        //         console.log('done');
        //         this.death();
        //     }
        // }
    }

    drawStairs(){
        this.platforms.forEach((p,i) => {
            p.draw(
                (canvas.width/2)+(this.platSpacing[0]*(p.num-this.player.position[0])),
                 600+(this.platSpacing[1]*(-i+this.player.position[1])));
        });
    }

    drawScore(){
        let x = canvas.width/2;
        let y = 100;
        c.font = '30px sans-serif';
        c.textAlign = "center";
        c.fillStyle = '#ffffff';
        c.fillText(`Score: ${this.score}`, x, y);

    }

    addPlatform(i){
        let lr = randomOneOrMinusOne();
        this.platforms.push(new Platform(lr, i==0?0:this.platforms[i-1].num+lr));
    }

    handleSpace(){
        this.player.position[0] = this.player.position[0]+this.player.direction;
        // this.player.position[1]++;
        this.platforms.shift();
        this.addPlatform(this.nPlat-1);
        this.checkDeath();
    }
    handleCtrl(){
        this.player.direction *= -1;
        this.handleSpace();
        this.checkDeath();
    }
    
    checkDeath(){
        if(this.player.position[0]!=this.platforms[0].num){
            console.log('dead!');
            this.gameState = false;
            this.death();
        }else{
            console.log('alive!');
            this.score++;
        }
    }

    death(){
        console.log('game over!');
        // Animate death
        // this.player.deathAnimation(this);
        this.gameState = false;
        this.player.isAnimatingDeath = true;
        // this.init();
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
        this.isAnimatingDeath = false;
    }

    draw(){
        c.fillStyle = this.color;
        c.ellipse(this.actualPos[0],this.actualPos[1]-(this.rad), this.rad,this.rad,0,0,2*Math.PI);
        c.fill();
        //maybe add a face to it for direction or maybe dont for more fun and dificulty
    }

    // deathAnimation(game){
    //     let speed = 0;
    //     while(this.actualPos[1] < canvas.height+(this.rad*2)){
    //         bg();
    //         game.drawStairs();
    //         speed += 0.0001;
    //         this.actualPos[1] += speed;
    //         this.draw();
    //     }
    //     console.log('done');
    // }

    deathAnimation(game){
        if(this.actualPos[1] < canvas.height+(this.rad*2)){
            bg();
            this.speed += 0.01;
            this.actualPos[1] += this.speed;
            this.draw();
        }else{
            this.isAnimatingDeath = false;
        }
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
    if(main.gameState == false && main.player.isAnimatingDeath){
        console.log("doing death stuff")
        main.player.deathAnimation(main);
    }else{
        main.draw();
    }
    requestAnimationFrame(loop);
}

let main = new Game();

main.init();
loop();