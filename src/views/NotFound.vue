<template>
    <div class="not-found">
        <div class="not-found-content">
            <div class="not-found-content-pic">
                <img class="not-found-content-pic-parent" src="@/assets/img/404.png" alt="404" />
                <img class="not-found-content-pic-left" src="@/assets/img/404_cloud.png" alt="404" />
                <img class="not-found-content-pic-mid" src="@/assets/img/404_cloud.png" alt="404" />
                <img class="not-found-content-pic-right" src="@/assets/img/404_cloud.png" alt="404" />
            </div>
            <div class="not-found-content-explain">
                <div class="not-found-content-explain-title">页面丢了!</div>
                <div class="not-found-content-explain-info">
                    版权归 <a style="color: #20a0ff" href="https://www.template.com" target="_blank">模板</a> 所有
                </div>
                <div class="not-found-content-explain-headline">您访问的页面找不到喔~</div>
                <div class="not-found-content-explain-info">
                    请检查您输入的网址是否正确并拥有访问权限，或单击下面的按钮返回主页。
                </div>
                <router-link to="/" class="not-found-content-explain-home">回到首页</router-link>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "NotFound"
    };
</script>

<style lang="scss" scoped>
    .not-found {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;

        &-content {
            position: relative;
            width: 1200px;
            padding: 0 50px;
            overflow: hidden;

            &-pic {
                position: relative;
                float: left;
                width: 600px;
                overflow: hidden;

                &-parent {
                    width: 100%;
                }

                &-left {
                    position: absolute;
                    width: 80px;
                    top: 17px;
                    left: 220px;
                    opacity: 0;
                    animation-name: cloudLeft;
                    animation-duration: 2s;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    animation-delay: 1s;
                }

                &-mid {
                    position: absolute;
                    width: 46px;
                    top: 10px;
                    left: 420px;
                    opacity: 0;
                    animation-name: cloudMid;
                    animation-duration: 2s;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    animation-delay: 1.2s;
                }

                &-right {
                    position: absolute;
                    width: 62px;
                    top: 100px;
                    left: 500px;
                    opacity: 0;
                    animation-name: cloudRight;
                    animation-duration: 2s;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    animation-delay: 1s;
                }

                @keyframes cloudLeft {
                    0% {
                        top: 17px;
                        left: 220px;
                        opacity: 0;
                    }
                    20% {
                        top: 33px;
                        left: 188px;
                        opacity: 1;
                    }
                    80% {
                        top: 81px;
                        left: 92px;
                        opacity: 1;
                    }
                    100% {
                        top: 97px;
                        left: 60px;
                        opacity: 0;
                    }
                }

                @keyframes cloudMid {
                    0% {
                        top: 10px;
                        left: 420px;
                        opacity: 0;
                    }
                    20% {
                        top: 40px;
                        left: 360px;
                        opacity: 1;
                    }
                    70% {
                        top: 130px;
                        left: 180px;
                        opacity: 1;
                    }
                    100% {
                        top: 160px;
                        left: 120px;
                        opacity: 0;
                    }
                }

                @keyframes cloudRight {
                    0% {
                        top: 100px;
                        left: 500px;
                        opacity: 0;
                    }
                    20% {
                        top: 120px;
                        left: 460px;
                        opacity: 1;
                    }
                    80% {
                        top: 180px;
                        left: 340px;
                        opacity: 1;
                    }
                    100% {
                        top: 200px;
                        left: 300px;
                        opacity: 0;
                    }
                }
            }

            &-explain {
                position: relative;
                float: left;
                width: 300px;
                padding: 30px 0;
                overflow: hidden;

                &-title {
                    font-size: 32px;
                    font-weight: bold;
                    line-height: 40px;
                    color: #1482f0;
                    opacity: 0;
                    margin-bottom: 20px;
                    animation-name: slideUp;
                    animation-duration: 0.5s;
                    animation-fill-mode: forwards;
                }

                &-headline {
                    font-size: 20px;
                    line-height: 24px;
                    color: #222;
                    font-weight: bold;
                    opacity: 0;
                    margin-bottom: 10px;
                    animation-name: slideUp;
                    animation-duration: 0.5s;
                    animation-delay: 0.1s;
                    animation-fill-mode: forwards;
                }

                &-info {
                    font-size: 13px;
                    line-height: 21px;
                    color: grey;
                    opacity: 0;
                    margin-bottom: 30px;
                    animation-name: slideUp;
                    animation-duration: 0.5s;
                    animation-delay: 0.2s;
                    animation-fill-mode: forwards;
                }

                &-home {
                    display: block;
                    float: left;
                    width: 110px;
                    height: 36px;
                    background: #1482f0;
                    border-radius: 100px;
                    text-align: center;
                    color: #ffffff;
                    opacity: 0;
                    font-size: 14px;
                    line-height: 36px;
                    cursor: pointer;
                    animation-name: slideUp;
                    animation-duration: 0.5s;
                    animation-delay: 0.3s;
                    animation-fill-mode: forwards;
                }

                @keyframes slideUp {
                    0% {
                        transform: translateY(60px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            }
        }
    }
</style>
