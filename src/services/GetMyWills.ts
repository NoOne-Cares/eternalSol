import axios from 'axios'

enum MyWills {
    Creator = "creator",
    Receiver = "receiver",
}

const GetWill = async (key: string, type: MyWills): Promise<any> => {
    let url = ""
    if (type == MyWills.Creator) {
        url = `/api/getsenderwill?sender=${key}`
    } else {
        url = `/api/getsenderwill?receiver=${key}`
    }

    return axios.get(url)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            console.error('Error:', err);
            throw err;
        });
}

export const GetWillsCreatedByMe = (key: string) => GetWill(key, MyWills.Creator)
export const GetWillsRecivedByMe = (key: string) => GetWill(key, MyWills.Receiver)