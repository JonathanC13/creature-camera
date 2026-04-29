const errorTextConversion = (error) => {
    let status = ''
    let message = ''

    switch (error?.status) {
        case 'FETCH_ERROR':
            status = 'Server error'
            message = 'Server may be offline.'
            break
        default:
            status = error.status ?? 'Error'
            message = error.message ?? 'Something has gone wrong.'
            break
    }

    return {status, message}
}

export default errorTextConversion