document.addEventListener('DOMContentLoaded', () => {
    //console.log(hash);

    //===========================================================

    const pokemonList = (limit = 10, offset = 0) => {
        const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
        const queryString = `/?limit=${limit}&offset=${offset}`;
        fetch(baseUrl + queryString)
            .then((res) => {
                console.log(res);
                if (res.ok) {
                    return res.json();
                } else {
                    return Promise.reject('네트워크 장애');
                }
            })
            .then((resData) => {
                console.log(resData.results);
                return resData.results;
            })
            .then((itemArr) => {
                console.log(itemArr[0].url);

                itemArr.map((item) => {
                    fetch(item.url)
                        .then((res) => {
                            console.log(res);
                            if (res.ok) {
                                return res.json();
                            } else {
                                return Promise.reject('네트워크 장애');
                            }
                        })
                        .then((resData) => {
                            console.log('최종 : ', resData.results);
                            // const final = resData.map((item) => {
                            //     return {
                            //         id: item.id,
                            //         name: item.name,
                            //         image: data.sprites.other['official-artwork'].front_default,
                            //     };
                            // });
                            //console.log(final);
                            //return final;
                        })
                        .catch(() => {});
                    //return resData.results;
                });
            })
            .catch(() => {});
    };
    const listData = pokemonList(20);

    /* 
    fetch(baseUrl)
        .then((res) => {
            //console.log(res);
            if (res.ok) {
                return res.json();
            } else {
                return Promise.reject('네트워크 장애');
            }
        })
        .then((resData) => {
            console.log(resData);
        })
        .catch((err) => {
            console.error('에러내용 : ', err);
        }); */
});
