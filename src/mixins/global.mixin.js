import { GROUP_NAME_LIST } from '@/util/constants';

export default {
    computed: {
        getGroupNameList() {
            return groupId => GROUP_NAME_LIST[groupId] || 'Bilinmiyor';
        },
        getZoneList() {
            return Object.entries(GROUP_NAME_LIST).map(([value, label]) => ({
              label,
              value: Number(value)
            }));
        }
    }
};