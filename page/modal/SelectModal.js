import Modal from "./Modal";
import { DEVICE_HEIGHT, DEVICE_WIDTH, TOP_BOTTOM_OFFSET, BUTTON_COLOR_NORMAL, BUTTON_COLOR_PRESSED } from "../home/index.style";

import { gettext } from 'i18n'

const logger = DeviceRuntimeCore.HmLogger.getLogger("ha-zepp-selectdialog");

class SelectModal extends Modal {

    /**
     * 
     * @param {string} title Select title
     * @param {string} text Select textid in i18n
     * @param {[string]} options array of 48px img src (1-3) or null
     * @param {function(selectedOption)} callback 
     */
    constructor(app, title, text, options, callback, callbackArg) {
        super(app);
        this.controls = {
            title: null,
            text: null,
            currentOption: null,
            scrollList: null
        }
        this.state = { rendered: false, option: '', y: TOP_BOTTOM_OFFSET }
        this.props = { title, text, options }
        this.callback = callback
        this.callbackArg = callbackArg

        this.state.dataList = options.map((item) => {
            return { name: item };
        });
    }

    setOption(option) {
        this.state.option = option

        if (this.state.rendered)
            this.scrollListItemClick(this.props.options.indexOf(option), false)
    }

    scrollListItemClick(index, isUserInput) {
        this.controls.currentOption.setProperty(hmUI.prop.TEXT, this.props.options[index]);

        this.controls.scrollList.setProperty(hmUI.prop.UPDATE_DATA, {
            data_type_config: [
                {
                    start: 0,
                    end: index - 1,
                    type_id: 0,
                },
                {
                    start: index,
                    end: index,
                    type_id: 1,
                },
                {
                    start: index + 1,
                    end: this.state.dataList.length,
                    type_id: 0,
                },
            ],
            data_type_config_count: 3,
            data_array: this.state.dataList,
            data_count: this.state.dataList.length,
            on_page: 1,
        });

        if (this.state.rendered && isUserInput) {
            this.callback(this.props.options[index], this.callbackArg)
        }
    }

    onShow() {
        if (this.app.router.isModalShown()) return
        super.onShow()

        this.state.y = TOP_BOTTOM_OFFSET;
        this.state.rendered = false;

        const titleHeight = 40;

        this.controls.title = hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: this.state.y,
            w: DEVICE_WIDTH,
            h: titleHeight,
            text: this.props.title,
            text_size: 19,
            color: 0xffffff,
            align_h: hmUI.align.CENTER_H,
        });
        this.state.y += titleHeight;

        this.controls.text = hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: this.state.y,
            w: DEVICE_WIDTH / 2 - 5,
            h: 32,
            text: gettext(this.props.text),
            text_size: 17,
            color: 0xffffff,
            align_h: hmUI.align.LEFT,
        });

        this.controls.currentOption = hmUI.createWidget(hmUI.widget.TEXT, {
            x: 5 + DEVICE_WIDTH / 2,
            y: this.state.y,
            w: (DEVICE_WIDTH / 2) - 5,
            h: 32,
            text: this.state.option,
            text_size: 17,
            color: 0xffffff,
            align_h: hmUI.align.RIGHT,
        });
        this.state.y += 32;

        this.controls.scrollList = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
            x: 10,
            y: this.state.y + 20,
            h: DEVICE_HEIGHT - this.state.y - 20 - TOP_BOTTOM_OFFSET,
            w: DEVICE_WIDTH - 20,
            item_space: 10,
            item_config: [
                {
                    type_id: 0,
                    item_bg_color: 0x101010,
                    item_bg_radius: 10,
                    text_view: [
                        {
                            x: 10,
                            y: 16,
                            w: DEVICE_WIDTH - 40,
                            h: 32,
                            key: "name",
                            color: 0xffffff,
                            text_size: 18,
                        },
                    ],
                    text_view_count: 1,
                    item_height: 64,
                },
                {
                    type_id: 1,
                    item_bg_color: 0x262626,
                    item_bg_radius: 10,
                    text_view: [
                        {
                            x: 10,
                            y: 16,
                            w: DEVICE_WIDTH - 40,
                            h: 32,
                            key: "name",
                            color: 0xffffff,
                            text_size: 18,
                        },
                    ],
                    text_view_count: 1,
                    item_height: 64,
                },
            ],
            item_config_count: 2,
            data_array: this.state.dataList,
            data_count: this.state.dataList.length,
            item_click_func: (list, index) =>
                this.scrollListItemClick(index, true),
            data_type_config_count: 1,
        });

        this.scrollListItemClick(this.props.options.indexOf(this.state.option));

        this.state.rendered = true;
    }

    onHide() {
        if (!this.app.router.isModalShown()) return
        this.state.rendered = false;
        hmUI.deleteWidget(this.controls.title)
        hmUI.deleteWidget(this.controls.text)
        hmUI.deleteWidget(this.controls.currentOption)
        hmUI.deleteWidget(this.controls.scrollList)

        super.onHide()
    }
}

export default SelectModal