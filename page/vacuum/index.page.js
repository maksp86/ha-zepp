import { getEveryNth } from "../../utils";
import AppPage from "../Page";
import { ACCENT_COLOR, BUTTON_COLOR_NORMAL, BUTTON_COLOR_PRESSED, DEVICE_HEIGHT, DEVICE_WIDTH, TOP_BOTTOM_OFFSET } from "../home/index.style";

const logger = DeviceRuntimeCore.HmLogger.getLogger("ha-zepp-vacuum");
const { messageBuilder } = getApp()._options.globalData;

import { gettext } from 'i18n'
import SelectModal from "../modal/SelectModal";

const SUPPORT_TURN_ON = 1
const SUPPORT_TURN_OFF = 2
const SUPPORT_PAUSE = 4
const SUPPORT_STOP = 8
const SUPPORT_RETURN_HOME = 16
const SUPPORT_FAN_SPEED = 32
const SUPPORT_BATTERY = 64
const SUPPORT_STATUS = 128
const SUPPORT_SEND_COMMAND = 256
const SUPPORT_LOCATE = 512
const SUPPORT_CLEAN_SPOT = 1024
const SUPPORT_MAP = 2048
const SUPPORT_STATE = 4096
const SUPPORT_START = 8192

class VacuumPage extends AppPage {
    constructor(...props) {
        super(...props);
        this.controls = {
            batteryRect: null,
            batteryRectProps: null,
            batteryText: null,
            stateText: null,
            fanSpeedText: null,
            fanSpeedModal: null
        }
        this.state.reloadTimer = null
    }

    setReloadTimer(delay) {
        if (this.state.reloadTimer) timer.stopTimer(this.state.reloadTimer);

        this.state.reloadTimer = timer.createTimer(
            delay,
            10000,
            function (page) {
                page.getVacuumInfo();
            },
            this
        );
    }

    getVacuumInfo() {
        messageBuilder
            .request({ method: "GET_SENSOR", entity_id: this.item.key })
            .then(({ result, error }) => {
                if (error) {
                    this.drawError(error);
                    return;
                }
                this.item = result;
                if (!this.state.rendered)
                    this.drawElements();
                else
                    this.updateElements()
            })
            .catch((res) => {
                this.drawError();
                logger.log(res);
            });
    }

    sendVacuumCommand(id, command, payload) {
        messageBuilder.request({
            method: "VACUUM_SET",
            entity_id: id,
            value: payload,
            service: command,
        });
    }

    onFanSpeedSelect(speed, ctx) {
        ctx.controls.fanSpeedModal.setOption(speed)
        ctx.controls.fanSpeedText.setProperty(hmUI.prop.TEXT, speed)
        if (ctx.state.rendered)
            ctx.sendVacuumCommand(ctx.item.key, "set_fan_speed", `{"fan_speed": "${speed}"}`)
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

        this.controls.stateText = this.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: this.state.y + 10 - 15,
            w: DEVICE_WIDTH / 2 - 5,
            h: 30,
            text: gettext(this.item.state),
            text_size: 17,
            color: 0xffffff,
            align_h: hmUI.align.LEFT,
            align_v: hmUI.align.CENTER_V
        });

        if (this.item.attributes.supported_features & SUPPORT_BATTERY) {
            this.controls.batteryRectProps = {
                x: DEVICE_WIDTH / 4 * 2 + 4,
                y: this.state.y + 4,
                h: 12,
            }

            this.controls.batteryRect = this.createWidget(hmUI.widget.FILL_RECT, {
                ...this.controls.batteryRectProps,
                w: 32,
                radius: 0,
                color: 0xffffff
            })

            this.createWidget(hmUI.widget.STROKE_RECT, {
                x: DEVICE_WIDTH / 4 * 2,
                y: this.state.y,
                w: 40,
                h: 20,
                line_width: 2,
                radius: 5,
                color: 0xffffff
            })

            this.createWidget(hmUI.widget.FILL_RECT, {
                x: DEVICE_WIDTH / 4 * 2 + 40,
                y: this.state.y + 5,
                w: 3,
                h: 10,
                color: 0xffffff
            })

            this.controls.batteryText = this.createWidget(hmUI.widget.TEXT, {
                x: DEVICE_WIDTH / 4 * 3,
                y: this.state.y + 10 - 15,
                w: DEVICE_WIDTH / 4,
                h: 30,
                text: '',
                text_size: 17,
                color: 0xffffff,
                align_h: hmUI.align.LEFT,
                align_v: hmUI.align.CENTER_V
            });

        }
        this.state.y += 40

        if (this.item.attributes.supported_features & SUPPORT_FAN_SPEED) {
            this.createWidget(hmUI.widget.TEXT, {
                x: 0,
                y: this.state.y,
                w: DEVICE_WIDTH / 2 - 10,
                h: 32,
                text: gettext("fanspeed"),
                text_size: 17,
                color: 0xffffff,
                align_h: hmUI.align.LEFT,
            });

            this.controls.fanSpeedModal = new SelectModal(
                this.app,
                this.item.title,
                "fanspeed",
                this.item.attributes.fan_speed_list,
                this.onFanSpeedSelect,
                this)

            this.createWidget(hmUI.widget.BUTTON, {
                x: DEVICE_WIDTH / 2,
                y: this.state.y,
                w: DEVICE_WIDTH / 2,
                h: 32,
                radius: 16,
                normal_color: BUTTON_COLOR_NORMAL,
                press_color: BUTTON_COLOR_PRESSED,
                click_func: () => {
                    this.router.showModal(this.controls.fanSpeedModal);
                }
            });

            this.controls.fanSpeedText = this.createWidget(hmUI.widget.TEXT, {
                x: DEVICE_WIDTH / 2,
                y: this.state.y,
                w: DEVICE_WIDTH / 2,
                h: 32,
                text: this.item.attributes.fan_speed,
                text_size: 17,
                color: 0xffffff,
                align_h: hmUI.align.CENTER_H
            });
            this.controls.fanSpeedText.setEnable(false)

            this.state.y += 32 + 20
        }

        let col = 0
        const commands = [
            { command: "start", condition: SUPPORT_START },
            { command: "pause", condition: SUPPORT_PAUSE },
            { command: "stop", condition: SUPPORT_STOP },
            { command: "clean_spot", condition: SUPPORT_CLEAN_SPOT },
            { command: "locate", condition: SUPPORT_LOCATE },
            { command: "return_to_base", condition: SUPPORT_RETURN_HOME }
        ]

        const buttonWidth = DEVICE_WIDTH / 2 - 5
        const buttonHeight = 56
        const imgSize = 36

        for (let item of commands) {
            if (this.item.attributes.supported_features & item.condition) {
                let buttonX = col == 0 ? 0 : (DEVICE_WIDTH / 2 + 5)
                this.createWidget(hmUI.widget.BUTTON, {
                    x: buttonX,
                    y: this.state.y,
                    w: buttonWidth,
                    h: buttonHeight,
                    radius: buttonHeight / 4,
                    normal_color: BUTTON_COLOR_NORMAL,
                    press_color: BUTTON_COLOR_PRESSED,
                    click_func: () => {
                        this.sendVacuumCommand(this.item.key, item.command, '{}')
                    }
                })

                let buttonImg = this.createWidget(hmUI.widget.IMG, {
                    x: buttonX + (buttonWidth - imgSize) / 2,
                    y: this.state.y + (buttonHeight - imgSize) / 2,
                    w: imgSize,
                    h: imgSize,
                    src: `vacuum/${item.command}.png`,
                })
                buttonImg.setEnable(false)

                col++;
            }
            if (col > 1) {
                col = 0
                this.state.y += buttonHeight + 10
            }
        }

        this.updateElements();
        this.setReloadTimer(5000)
        this.state.rendered = true;
    }

    updateBatery() {
        const rectWidth = this.item.attributes.battery_level / 100 * 32
        this.controls.batteryRect.setProperty(hmUI.prop.MORE, {
            ...this.controls.batteryRectProps,
            w: rectWidth
        })

        this.controls.batteryText.setProperty(hmUI.prop.TEXT, `${this.item.attributes.battery_level}%`)

    }

    updateElements() {
        this.state.rendered = false;

        if (this.item.attributes.supported_features & SUPPORT_BATTERY)
            this.updateBatery()

        if (this.item.attributes.supported_features & SUPPORT_FAN_SPEED)
            this.onFanSpeedSelect(this.item.attributes.fan_speed, this)

        this.controls.stateText.setProperty(hmUI.prop.TEXT, gettext(this.item.state))

        this.state.rendered = true;
    }

    onInit(param) {
        logger.log('onInit')
        logger.log("param", param)
        this.item = param;
        this.app.setLayerScrolling(true)
    }

    onRender() {
        this.drawWait()
        this.getVacuumInfo()
    }

    onDestroy() {
        if (this.state.reloadTimer) {
            timer.stopTimer(this.state.reloadTimer);
            this.state.reloadTimer = null;
        }
        this.state.rendered = false
    }
}

export default VacuumPage;