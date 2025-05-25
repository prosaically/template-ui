<template>
    <router-view />
</template>

<script>
    export default {
        name: "App"
    };
</script>

<style lang="scss">
    // 引入图标
    @import url("@/assets/icon/iconfont.css");

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    em,
    i {
        font-style: normal;
    }

    ol,
    ul {
        list-style-type: none;
        list-style-position: inside;
    }

    html,
    body {
        background-color: #fff;
        color: $text-regular;
        width: 100%;
        height: 100%;
        font-size: 12px;
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
        font: 12px/1.5 Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, sans-serif;
    }

    img {
        border: 0;
        vertical-align: middle;
    }

    button {
        cursor: pointer;
        outline: none;
        border-width: 0;

        &:focus {
            outline: none;
        }
    }

    a {
        color: $text-regular;
        text-decoration: none;
    }

    a:hover {
        color: $color-primary;
    }

    input,
    button,
    textarea {
        font-family: Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, sans-serif;
    }

    input[readonly],
    textarea[readonly] {
        cursor: default;
        user-select: none;
    }

    map,
    area {
        outline: 0;
    }

    hr {
        border-style: solid none none none;
    }

    .hide,
    .none {
        display: none;
    }

    .line-1 {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .line-2,
    .line-3,
    .line-4,
    .line-5 {
        overflow: hidden;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box; // 弹性伸缩盒
        -webkit-box-orient: vertical; // 设置伸缩盒子元素排列方式
    }

    .line-2 {
        -webkit-line-clamp: 2;
    }

    .line-3 {
        -webkit-line-clamp: 3;
    }

    .line-4 {
        -webkit-line-clamp: 4;
    }

    .line-5 {
        -webkit-line-clamp: 5;
    }

    // chrome 滚动条
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 8px;
    }
    ::-webkit-scrollbar-thumb {
        background: #c9c9ca;
        border-radius: 8px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #b2b2b3;
    }

    // IE 滚动条
    * {
        scrollbar-face-color: #c7c7c7;
        scrollbar-highlight-color: #c7c7c7;
        scrollbar-3dlight-color: #c7c7c7;
        scrollbar-darkshadow-color: #c7c7c7;
        scrollbar-shadow-color: #c7c7c7;
        scrollbar-arrow-color: #c7c7c7;
        scrollbar-track-color: #ebebeb;
    }

    .bjs-powered-by {
        display: none;
    }

    .fjs-powered-by {
        display: none;
    }
</style>
