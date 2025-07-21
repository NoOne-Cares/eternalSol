import axios from 'axios'

enum MyWills {
    Creator = "creator",
    Receiver = "receiver",
}

export interface Will {
    _id?: string;
    message?: string;
    sender?: string;
    reciver?: string;
    amount?: number;
}

// export interface GetWillResponse {
//     success: boolean;
//     wills: Will[];
// }

const GetWill = async (key: string, type: MyWills): Promise<Will[]> => {
    let url = ""
    if (type == MyWills.Creator) {
        url = `/api/getsenderwill?sender=${key}`
    } else {
        url = `/api/getreciverwill?reciver=${key}`
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