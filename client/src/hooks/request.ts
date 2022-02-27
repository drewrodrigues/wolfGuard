import { AxiosRequestConfig } from 'axios'
import { useState } from 'react'
import { axiosInstance } from '../utils/axios'

interface useRequestNone {
  requestStatus: 'none'
  data: undefined
  error: undefined
}

const useRequestNoneValue: Omit<useRequestNone, 'call'> = {
  data: undefined,
  error: undefined,
  requestStatus: 'none'
}

interface useRequestInProgress {
  requestStatus: 'in-progress'
  data: undefined
  error: undefined
}

interface useRequestSuccess<T> {
  requestStatus: 'success'
  data: T
}

interface useRequestFail {
  requestStatus: 'failed'
  data: undefined
  error: string
}

type useRequestType<T> =
  | useRequestNone
  | useRequestInProgress
  | useRequestSuccess<T>
  | useRequestFail

export function useRequest<T>(): useRequestType<T> & {
  call: (url: string, config?: AxiosRequestConfig) => Promise<void>
} {
  const [state, setState] = useState<useRequestType<T>>(useRequestNoneValue)

  async function call(url: string, config?: AxiosRequestConfig) {
    setState((s) => ({
      data: undefined,
      error: undefined,
      requestStatus: 'in-progress'
    }))
    try {
      const response = await axiosInstance(url, config)
      const useRequestSuccessValue: useRequestSuccess<T> = {
        data: response.data,
        requestStatus: 'success'
      }
      setState(useRequestSuccessValue)
    } catch (e) {
      const useRequestFailValue: useRequestFail = {
        error: e as string,
        requestStatus: 'failed',
        data: undefined
      }

      setState(useRequestFailValue)
    }
  }

  return { ...state, call }
}
