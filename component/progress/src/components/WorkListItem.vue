<template>
    <div id="workListItem" class="work-list-item-container">
        <div class="work-list-item-text-container"
            @click="handleSelectMenu">
            {{ workInfo.name }}
        </div>
    </div>

</template>
<script>
export default {
    name: 'WorkListItem',
    components: {
    },
    props: {
        id: {
            type: String
        }
    },
    data() {
        return {
            workInfo: null
        }
    },
    methods: {
        handleSelectMenu() {
            this.$emit('select-item', this.id);
        }
    },
    computed: {
    },
    created() {
        this.workInfo = this.$store.getters.getWork(this.id);
    }
}
</script>
<style>
.work-list-item-container {
    width: 100%;
    height: 1.6em;
    background-color: beige;
    cursor: pointer;
    border-bottom: 1px solid #000000;
}
.work-list-item-text-container {
    padding-top: 0.2em;
}
</style>