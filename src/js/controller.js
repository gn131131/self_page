/*
 * @Description: 总控制器
 * @Version: 1.0
 * @Autor: Pumpking
 * @Date: 2020-02-11 16:56:12
 * @LastEditors: Pumpking
 * @LastEditTime: 2020-02-15 14:45:25
 */
import eventListenerFn from "./eventListener";
import utils from "./utils";
import canvasFn from "./canvasFn";
import mainModel from "./model";
import $ from "jquery";

let controllerFn = {
  init() {
    canvasFn.setCanvasToFullScreen(mainModel.canvasNode);
    eventListenerFn.init();
    window.requestAnimationFrame(this.canvasControllerMainFn);
  },
  canvasControllerMainFn() {
    // 清除鼠标特效--放最前
    if (!(mainModel.cursor.axisX && mainModel.cursor.axisY && mainModel.cursor.isClicked)) {
      controllerFn.cursor.clearAnimation();
    }
    // 界面清除--放中间
    controllerFn.game[mainModel.game.mode].clearGame();
    // 界面渲染--放中间
    controllerFn.game[mainModel.game.mode].drawGame();
    // 鼠标特效渲染--放最后
    if (mainModel.cursor.axisX && mainModel.cursor.axisY && mainModel.cursor.isClicked) {
      controllerFn.cursor.drawAnimation();
    }
    window.requestAnimationFrame(controllerFn.canvasControllerMainFn);
  },
  game: {
    snake: {
      drawGame() {
        this.drawWall();
      },
      clearGame() {
        this.clearWall();
      },
      drawWall() {
        const wallModel = mainModel.game.snake.wall;
        wallModel.axis = [{
            x: wallModel.x,
            y: wallModel.y
          },
          {
            x: wallModel.x + wallModel.w,
            y: wallModel.y
          },
          {
            x: wallModel.x + wallModel.w,
            y: wallModel.y + wallModel.h
          },
          {
            x: wallModel.x,
            y: wallModel.y + wallModel.h
          },
        ];
        canvasFn.drawLine(mainModel.ctx, wallModel.axis, wallModel.color, wallModel.width);
      },
      clearWall() {
        const wallModel = mainModel.game.snake.wall;
        canvasFn.clearRect(mainModel.ctx, wallModel.x - wallModel.width, wallModel.y - wallModel.width, wallModel.w + 2 * wallModel.width, wallModel.h + 2 * wallModel.width);
      }
    }
  },
  cursor: {
    drawAnimation() {
      const rectModel = mainModel.cursor.rect;

      if (rectModel.mode === 'picture') {
        $.each(rectModel.picArray, (i, item) => {
          let image = new Image();
          image.src = item;
          rectModel.imageArray.push(image);
        });
      }

      $.each(rectModel.randomInfoArray, (i, item) => {
        this.clearRectByRandomInfo(item);
      });
      rectModel.count++;
      if (rectModel.count === rectModel.countInterval) {
        if (rectModel.randomInfoArray.length === rectModel.showNumber) {

          rectModel.randomInfoArray[rectModel.currentIndex] = controllerFn.cursor.generateInfo(mainModel.cursor);
          if (rectModel.currentIndex === rectModel.randomInfoArray.length - 1) {
            rectModel.currentIndex = 0;
          } else {
            rectModel.currentIndex++;
          }
        } else {
          rectModel.randomInfoArray.push(controllerFn.cursor.generateInfo(mainModel.cursor));
        }
        rectModel.count = 0;
      }
      $.each(rectModel.randomInfoArray, (i, item) => {
        if (rectModel.mode === 'rect') {
          this.drawRectByRandomInfo(item);
        } else if (rectModel.mode === 'picture') {
          this.drawPicByRandomInfo(item);
        }
      });
    },
    clearAnimation() {
      const rectModel = mainModel.cursor.rect;
      $.each(rectModel.randomInfoArray, (i, item) => {
        controllerFn.cursor.clearRectByRandomInfo(item);
      });
      rectModel.randomInfoArray = [];
      rectModel.count = 0;
      rectModel.currentIndex = 0;
    },
    generateInfo(cursor) {
      const rectModel = mainModel.cursor.rect;
      const randomRectInfo = {
        x: cursor.axisX,
        y: cursor.axisY,
        randomOffsetX: utils.getSimpleRandomNumber(rectModel.offsetXScope[0], rectModel.offsetXScope[1]),
        randomOffsetY: utils.getSimpleRandomNumber(rectModel.offsetYScope[0], rectModel.offsetYScope[1]),
        randomWidth: utils.getSimpleRandomNumber(rectModel.widthScope[0], rectModel.widthScope[1]),
        randomColor: utils.getSimpleRandomColor(),
        randomImage: utils.getRandomItemFromArray(rectModel.imageArray)
      }
      randomRectInfo.randomHeight = randomRectInfo.randomWidth;
      return randomRectInfo;
    },
    drawRectByRandomInfo(obj) {
      canvasFn.drawRect(mainModel.ctx, obj.x + obj.randomOffsetX - obj.randomWidth / 2, obj.y + obj.randomOffsetY - obj.randomHeight / 2, obj.randomWidth, obj.randomHeight, null, true, obj.randomColor, mainModel.cursor.rect.borderWidth);
    },
    clearRectByRandomInfo(obj) {
      const borderWidth = mainModel.cursor.rect.borderWidth || 1;
      canvasFn.clearRect(mainModel.ctx, obj.x + obj.randomOffsetX - borderWidth - obj.randomWidth / 2, obj.y + obj.randomOffsetY - borderWidth - obj.randomHeight / 2, obj.randomWidth + 2 * borderWidth, obj.randomHeight + 2 * borderWidth);
    },
    drawPicByRandomInfo(obj) {
      canvasFn.drawPic(mainModel.ctx, obj.randomImage, obj.x + obj.randomOffsetX - obj.randomWidth / 2, obj.y + obj.randomOffsetY - obj.randomHeight / 2, obj.randomWidth, obj.randomHeight);
    }
  }
};

export default controllerFn;