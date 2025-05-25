/**
 * Vue paging extends
 *
 * @author: weison
 * @sine:   2023-06-14 14:44:00
 * @version 1.0.0
 */

export default {
    data() {
        return {
            pageNo: 1,
            pageSize: 10,
            total: 0,
            records: [],
            selections: []
        };
    },
    methods: {
        selectionChange(e) {
            this.selections = e;
        },
        pageChange(e) {
            this.pageNo = e;
        }
    }
};
