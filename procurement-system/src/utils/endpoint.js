import axios from "axios"
import { toast } from "react-toastify"

// export const baseURL = "http://localhost:5000/api" // local
export const baseURL = "https://procurement-3j6q.onrender.com/api" // server
// export const baseURL = "https://civil-guruji-api.onrender.com" // server

const Axios = axios.create({
    baseURL: baseURL,
})

export const api = async (url, type, data, headers, options = {}) => {

    let requestTypes = ['get', 'post', 'put', 'delete']
    let requestType = requestTypes.find((reqType) => { return reqType === type })

    if (requestType) {
        try {
            const response = await Axios({
                method: requestType,
                url: url,
                data: data,
                headers: {
                    ...headers,
                    'x-access-token': localStorage.getItem('accessToken')
                },
                ...options
            })
            return response
        } catch (e) {

            if (e?.response?.status === 404) {
                console.log("404 Error:", e); 
            }
            
            if (e?.response?.status == 403) {
                try {

                    let refreshResponse = await Axios.get('/token/refresh', {
                        headers: {
                            'x-refresh-token': localStorage.getItem('refreshToken')
                        }
                    })

                    if (refreshResponse?.data?.access_token) {
                        localStorage.setItem('accessToken', refreshResponse?.data?.access_token)
                        return await api(url, type, data, headers, options)
                    } else {
                        // expired refresh token
                        toast.error("Please login First")
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('refreshToken')
                        if (!(document.location.pathname == '/login')) {
                            document.location.href = '/login'
                        }
                        return Promise.reject(e)
                    }

                } catch (error) {
                    toast.error("Please Login First")
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    if (!(document.location.pathname == '/login')) {
                        document.location.href = '/login'
                    }
                    return Promise.reject(e)
                }
            }
             else {
                return Promise.reject(e)
            }

        }
    } else {
        return Promise.reject("invalid request type")
    }
}
