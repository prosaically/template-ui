/**
 * Created by Liu.Jun on 2019/9/29 18:58.
 */

// 基础组件
import PackInput from "../viewComponents/Input";
import PackColor from "../viewComponents/Color";
import PackInputNumber from "../viewComponents/InputNumber";
import PackSlider from "../viewComponents/Slider";

// 是否 Boolean
import PackBooleanSwitch from "../viewComponents/SelectBoolean/elSwitch";
import PackBooleanCheckbox from "../viewComponents/SelectBoolean/elCheckbox";
import PackBooleanSelect from "../viewComponents/SelectBoolean/elSelect";
import PackBooleanRadio from "../viewComponents/SelectBoolean/elRadio";

// 单多选
import PackRadio from "../viewComponents/SingleSelect/elRadio";
import PackRadioSelect from "../viewComponents/SingleSelect/elSelect";

import PackMultiSelect from "../viewComponents/MultiSelect/elSelect";
import PackMultiCheckbox from "../viewComponents/MultiSelect/elCheckbox";

// 上传
import PackUpload from "../viewComponents/Upload";
import PackMultiUpload from "../viewComponents/MultiUpload";

// 时间 日期
import PackTime from "../viewComponents/Time";

// 日期
import PackDate from "../viewComponents/Date";
import PackDateString from "../viewComponents/Date/string";

// 日期时间
import PackDateTime from "../viewComponents/DateTime";
import PackDateTimeString from "../viewComponents/DateTime/string";

// 日期区间
import PackDateRange from "../viewComponents/DateRange";
import PackDateRangeString from "../viewComponents/DateRange/string";

// 日期时间区间
import PackDateTimeRange from "../viewComponents/DateTimeRange";
import PackDateTimeRangeString from "../viewComponents/DateTimeRange/string";

// 布局 Object Array
import PackObject from "../viewComponents/Object";
import PackArray from "../viewComponents/Array";

/**
 * maxNum Number 最大可配置数
 * topDisplay Bool 最顶部显示
 * bottomDisplay Bool 最底部显示
 * onlyCanConfig Bool 是否只能配置数据，不能删除 copy
 * @type {*[]}
 */
const tools = [
    {
        groupName: "布局组件",
        componentList: [
            {
                title: "Object",
                btnClass: "w100",
                componentPack: PackObject
            },
            {
                title: "Array",
                btnClass: "w100",
                componentPack: PackArray
            }
        ]
    },
    {
        groupName: "基础组件",
        componentList: [
            {
                title: "输入框",
                componentPack: PackInput
            },
            {
                title: "数字(slider)", // 这里顺便必须在 PackInputNumber 前，导入匹配的时候优先匹配
                componentPack: PackSlider
            },
            {
                title: "数字输入框",
                componentPack: PackInputNumber
            },
            {
                title: "颜色选择",
                componentPack: PackColor
            }
        ]
    },
    {
        groupName: "是否Bool",
        componentList: [
            {
                title: "是否(Switch)",
                componentPack: PackBooleanSwitch
            },
            {
                title: "是否(Checkbox)",
                componentPack: PackBooleanCheckbox
            },
            {
                title: "是否(Select)",
                componentPack: PackBooleanSelect
            },
            {
                title: "是否(Radio)",
                componentPack: PackBooleanRadio
            }
        ]
    },
    {
        groupName: "单选/多选",
        componentList: [
            {
                title: "单选(Radio)",
                componentPack: PackRadio
            },
            {
                title: "单选(Select)",
                componentPack: PackRadioSelect
            },
            {
                title: "多选(Select)",
                componentPack: PackMultiSelect
            },
            {
                title: "多选(Checkbox)",
                componentPack: PackMultiCheckbox
            }
        ]
    },
    {
        groupName: "文件上传",
        componentList: [
            {
                title: "单文件",
                componentPack: PackUpload
            },
            {
                title: "多个文件",
                componentPack: PackMultiUpload
            }
        ]
    },
    {
        groupName: "时间日期",
        componentList: [
            {
                title: "Date(时间戳)",
                componentPack: PackDate
            },
            {
                title: "Date(字符串)",
                componentPack: PackDateString
            },
            {
                title: "DateTime(时间戳)",
                componentPack: PackDateTime
            },
            {
                title: "DateTime(字符串)",
                componentPack: PackDateTimeString
            },
            {
                title: "Date范围(时间戳)",
                componentPack: PackDateRange
            },
            {
                title: "Date范围(字符串)",
                componentPack: PackDateRangeString
            },
            {
                title: "DateTime范围(时间戳)",
                componentPack: PackDateTimeRange
            },
            {
                title: "DateTime范围(字符串)",
                componentPack: PackDateTimeRangeString
            },
            {
                title: "Time(字符串)",
                componentPack: PackTime
            }
        ]
    }
];

export default tools;
