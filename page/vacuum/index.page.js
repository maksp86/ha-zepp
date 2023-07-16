import { getEveryNth } from "../../utils";
import AppPage from "../Page";
import { ACCENT_COLOR, BUTTON_COLOR_PRESSED, DEVICE_HEIGHT, DEVICE_WIDTH, TOP_BOTTOM_OFFSET } from "../home/index.style";

const logger = DeviceRuntimeCore.HmLogger.getLogger("ha-zepp-vacuum");
const { messageBuilder } = getApp()._options.globalData;

import { gettext } from 'i18n'

class VacuumPage extends AppPage {
    constructor(...props) {
        super(...props);
        this.controls = {
            batteryRect: null,
            batteryText: null,
            stateText: null,
        }
    }

    getSensorInfo() {
        messageBuilder
            .request({ method: "GET_SENSOR", entity_id: this.item.key })
            .then(({ result, error }) => {
                if (error) {
                    this.drawError(error);
                    return;
                }
                this.item = result;
                this.drawElements();
            })
            .catch((res) => {
                this.drawError();
            });
    }

    drawElements() {
        this.state.rendered = false;
        this.clearWidgets()

        const titleHeight = 40;

        this.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: this.state.y,
            w: DEVICE_WIDTH,
            h: titleHeight,
            text: this.item.title,
            text_size: 19,
            color: 0xffffff,
            align_h: hmUI.align.CENTER_H,
        });
        this.state.y += titleHeight + 10

        this.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: this.state.y,
            w: DEVICE_WIDTH,
            h: titleHeight,
            text: this.item.title,
            text_size: 19,
            color: 0xffffff,
            align_h: hmUI.align.CENTER_H,
        });


        this.createWidget(hmUI.widget.FILL_RECT, {
            x: DEVICE_WIDTH - 15 - 50 + 4,
            y: this.state.y,
            w: 50,
            h: 14,
            line_width: 2,
            radius: 3,
            color: 0xffffff
        })

        this.createWidget(hmUI.widget.FILL_RECT, {
            x: DEVICE_WIDTH - 15 - 50,
            y: this.state.y,
            w: 50,
            h: 14,
            line_width: 2,
            radius: 3,
            color: 0xffffff
        })

        this.createWidget(hmUI.widget.STROKE_RECT, {
            x: DEVICE_WIDTH - 15 - 50,
            y: this.state.y,
            w: 50,
            h: 20,
            line_width: 2,
            radius: 5,
            color: 0xffffff
        })

        this.createWidget(hmUI.widget.FILL_RECT, {
            x: DEVICE_WIDTH - 17,
            y: this.state.y + 5,
            w: 5,
            h: 10,
            color: 0xffffff
        })

        this.state.rendered = true;
    }

    onInit(param) {
        logger.log('onInit')
        logger.log("param", param)
        this.item = param;
    }

    onRender() {
        this.drawWait()
        this.getSensorInfo()
    }

    onDestroy() {
        this.state.rendered = false
    }
}

export default VacuumPage;