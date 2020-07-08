<template>
    <div v-if="isType()" id="basePointAddEditor" class="basepoint-add-container">
        <div class="basepoint-add-title-container">
            ADD BASEPOINT
        </div>
        <div class="basepoint-add-body-container">
            <div class="basepoint-add-body-content-container">
            <div class="basepoint-add-body-content-title">NAME</div>
            <input id="basepointName" type="text" class="basepoint-add-body-content-message"
                maxlength="30" @change="handleChangeName">
            </div>
        </div>
        <div class="basepoint-add-button-container">
            <div class="basepoint-add-ok-button"
                @click="handleOkButton">
            OK
            </div>
            <div class="basepoint-add-cancle-button"
                @click="handleCancelButton">
            CANCEL
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'AddBasePoint',
    components: {
    },
    props: {
        type: {
            type: Number,
            default: -1
        },
    },
    data() {
        return {
            basePointName: null
        }
    },
    methods: {
        _clearData() {
            this.basePointName = null;
        },
        isType() {
            return this.type == window.CONSTANTS.TYPE.ADD_BASEPOINT;
        },
        handleOkButton() {
            if (this.basePointName !== null) {
                let data = {
                    name: this.basePointName
                }
                this.$emit('select-ok-button', data);
                this._clearData();
            }
        },
        handleCancelButton() {
            this.$emit('select-cancel-button', {});
            this._clearData();
        },
        handleChangeName(e) {
            this.basePointName = e.target.value;
        }
    },
    computed: {
    },
    created() {
    }
}
</script>
<style>
.basepoint-add-container {
    position: absolute;
    width: 400px;
    height: 100%;
    right: 0;
    z-index: 1;
    background-color: #39B2FF;
    color: #ffffff;
    cursor: default;
    border-radius: 10px 0 0 10px!important;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
}
.basepoint-add-title-container {
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 2em;
    padding: 1em;
}
.basepoint-add-body-container {
    width: 100%;
    height: 75%;
    padding: 1em;
}
.basepoint-add-body-content-container {
    font-size: 1.4em;
}
.basepoint-add-body-content-title {
    width: 30%;
    height: 2.4em;
    font-size: 15px;
    display: inline-block;
}
.basepoint-add-body-content-message {
    width: 70%;
    height: 2.4em;
    font-size: 15px;
    border-radius: 5px;
    border: 1px solid rgb(220, 220, 220);
    padding: 5px;
    box-sizing: border-box;
    display: inline-block;
    color: #1b94e2;
}
.basepoint-add-button-container {
    width: 100%;
    height: 15%;
    text-align: center;
}
.basepoint-add-ok-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
.basepoint-add-cancle-button {
    display: inline-block;
    margin: 5px;
    padding: 5px;
    font-size: 20px;
    cursor: pointer;
    width: 6em;
    height: 2em;
    border-radius: 10px;
    border: 2px solid #dcdcdc;
    background-color: #ffffff;
    color: #1b94e2;
}
</style>