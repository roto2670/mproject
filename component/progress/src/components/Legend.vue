<template>
    <div v-if="getShowStatus" id="legend" class="legend-container">
        <div class="sub-container">
            <div class="title-container">I. Current Status</div>
            <div class="message-container">
                <div>
                    <div class="color-container" style="background: #ff0a01;"></div>
                    <div class="message-box">Excavation in Progress</div>
                </div>
                <div>
                    <div class="color-container" style="background: #0f02ff;"></div>
                    <div class="message-box">Rock Supporting in Progress</div>
                </div>
                <div>
                    <div class="color-container" style="background: #feff00;"></div>
                    <div class="message-box">Idle</div>
                </div>
            </div>
        </div>
        <div class="sub-container">
            <div class="title-container">II. Tunnel Excavated (Progress)</div>
            <div class="message-container">
                <div>
                    <div class="color-container" style="background: #01b050;"></div>
                    <div class="message-box">Top Heading</div>
                </div>
                <div>
                    <div class="color-container" style="background: #9f5900;"></div>
                    <div class="message-box">Bench-01</div>
                </div>
                <div>
                    <div class="color-container" style="background: #7031a0;"></div>
                    <div class="message-box">Bench-02</div>
                </div>
            </div>
        </div>
        <div class="sub-container">
            <div class="title-container">III. Tunnel Guide (Target)</div>
            <div class="message-container">
                <div>
                    <div class="color-container" style="background: #01b050; opacity: 0.6;"></div>
                    <div class="message-box">Top Heading</div>
                </div>
                <div>
                    <div class="color-container" style="background: #9f5900; opacity: 0.6;"></div>
                    <div class="message-box">Bench-01</div>
                </div>
                <div>
                    <div class="color-container" style="background: #7031a0; opacity: 0.6;"></div>
                    <div class="message-box">Bench-02</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Legend',
    components: {
    },
    props: {
        isShow: {
            type: Boolean
        },
    },
    data() {
        return {
        }
    },
    methods: {
    },
    computed: {
        getShowStatus() {
            return this.isShow;
        }
    },
    created() {
    }
}
</script>
<style>
.legend-container {
    position: absolute;
    right: 0.8%;
    top: 8%;
    z-index: 5;
    background: #a8dfff;
    width: 340px;
    height: 380px;
    border: 2px solid #0000ff;
    cursor: default;
}
.sub-container {
    margin: 1em;
}
.title-container {
    color: #ffffff;
    font-size: 19px;
    font-weight: bold;
    padding: 4px 8px 4px 8px;
    background: rgba(85, 185, 250, 0.5);
}
.message-container {
    padding-left: 16px;
    padding-top: 8px;
}
.color-container {
    display: inline-block;
    width: 26px;
    height: 13px;
}
.message-box {
    display: inline-block;
    color: #0c649e;
    font-size: 15px;
    font-weight: bold;
    padding-left: 8px;
}
</style>