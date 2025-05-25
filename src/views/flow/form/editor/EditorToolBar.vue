<template>
    <div :class="$style.box">
        <div v-for="(group, index) in configTools" :key="index" :class="$style.group">
            <h3 :class="$style.groupName">{{ group.groupName }}({{ group.componentList.length }})</h3>
            <draggable
                v-model="group.componentList"
                :class="$style.groupList"
                :sort="false"
                :group="{name: dragGroup, pull: 'clone', put: false}"
                :clone="clone"
            >
                <div
                    v-for="(item, cIndex) in group.componentList"
                    :key="cIndex"
                    :class="{
                        [$style.listItem]: true,
                        draggableToolItem: true
                    }"
                >
                    <span>{{ item.title }}</span>
                </div>
            </draggable>
        </div>
    </div>
</template>

<script>
    import Draggable from "vuedraggable";

    import {generateEditorItem} from "./common/editorData";

    export default {
        name: "EditorToolBar",
        components: {
            Draggable
        },
        props: {
            configTools: {
                type: Array,
                default: () => []
            },
            dragGroup: {
                default: "",
                type: String
            }
        },
        methods: {
            clone(target) {
                return generateEditorItem(target);
            }
        }
    };
</script>

<style lang="scss" module>
    .box {
        padding: 10px;
        overflow: auto;
        background-color: #fff;

        &::-webkit-scrollbar {
            width: 0;
            height: 0;
        }
    }

    .group {
        margin-top: 20px;

        &:first-child {
            margin-top: 0;
        }
    }

    .groupName {
        font-size: 15px;
        font-weight: bold;
        line-height: 18px;
        color: $text-primary;
    }

    .groupList {
        margin-top: -10px;
        display: flex;
        flex-wrap: wrap;
        padding: 10px 0;
        justify-content: space-between;
    }

    .listItem {
        position: relative;
        margin-top: 10px;
        width: 47%;
        max-width: 120px; /* 避免拖动ghost样式异常 */
        height: 36px;
        line-height: 36px;
        cursor: move;
        flex-shrink: 0;
        transition: box-shadow 0.3s ease;
        display: flex;
        text-align: center;
        align-items: center;
        justify-content: center;
        background-color: $background-color;
        border: 1px dashed transparent;
        font-size: 12px;

        > span {
            display: block;
            width: 100%;
            padding: 0 3px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            word-wrap: normal;
            word-break: normal;
        }

        &:hover {
            color: $color-primary;
            border: 1px dashed $color-primary;
            box-shadow: 0 0 4px 1px $color-primary-light-8;
        }
    }
</style>
