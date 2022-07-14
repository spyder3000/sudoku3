const getPuzzle = async (wordCount) =>  {
    const response = await fetch(`//puzzle.mead.io/puzzle?wordCount=${wordCount}`)
    if (response.status === 200) {
        // .json() returns a promise that resolves with the result of parsing the body text as JSON
        const data = await response.json();   // waits to get parsed data
        return data.puzzle
    } else {
        throw new error('Unable to fetch puzzle'); 
    }
}

const getCountry = async (countryCode) => {
    const response =  await fetch(`//restcountries.eu/rest/v2/all`);   // returns an array of all countries
    if (response.status === 200) {
        const data = await response.json()  // .json() returns a promise that resolves with the result of parsing the body text as JSON
        return data.find((dat) => { return dat.alpha2Code === countryCode  })  // e.g. object containing info for the matched country
    } else {
        throw new error ('Unable to fetch data')
    }
}

const getLocation = async () => {
    const response = await fetch(`//ipinfo.io/json?token=55359a2dbdfd18`); 
    if (response.status === 200) {
        return response.json()  // .json() returns a promise that resolves with the result of parsing the body text as JSON
    } else {
        throw new error ('Unable to fetch data')
    }
}

const getCurrentCountry = async() => {
    const location = await getLocation();
    // console.log('aa', location)
    return await getCountry(location.country) 
}

export { getPuzzle as default}