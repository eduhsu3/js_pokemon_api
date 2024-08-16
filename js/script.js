document.addEventListener('DOMContentLoaded', () => {
    //가져올 개수
    const limitNum = 10;

    //=============== 포켓몬 정보 가공하기 =======================================
    //기본 주소를 이용하여 -> 상세정보를 가져오게되고 -> 그 정보중 일부만 사용하기 위해 다시 loadedPokemon 배열에 넣어둔다.
    const pokemonList = async (limit = 10) => {
        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon/?limit=${limitNum}`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                //return data.results;

                const loadedPokemon = data.results.map((item, idx) => {
                    return {
                        name: koreanNames[idx],
                        id: idx + 1,
                        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idx + 1}.png`,
                    };
                });
                return loadedPokemon;
            } else if (response.status === 404) {
                throw new Error('404 에러가 발생했습니다. 서버 관리자에게 요청하세요');
            }
        } catch (error) {
            console.error('에러 : ', error);
        }
    };

    //========== 화면 렌더링 ===================================
    const htmlRender = (arr) => {
        arr.forEach((item, idx) => {
            const eleBody = document.querySelector('body');
            let html = '';
            eleBody.innerHTML += `
            <p>${item.name}</p>
            <img src="${item.image}" alt="" />
            `;
            /* const eleP = document.createElement('p');
            eleP.textContent = item.name;
            eleBody.appendChild(eleP); */
        });
    };

    //=========== 한국명 처리 ================================
    const koreanNames = [];
    const urls = [];
    for (let i = 0; i < limitNum; i++) {
        let url = `https://pokeapi.co/api/v2/pokemon-species/${i + 1}/`;
        urls.push(url);
    }

    let requestsArr = urls.map((url) => {
        return fetch(url);
    });

    Promise.all(requestsArr)
        .then((response) => {
            return Promise.all(response.map((res) => res.json()));
        })
        .then((data) => {
            console.log('어떤값 : ', data);
            data.forEach((item, idx) => {
                koreanNames.push(item.names[2].name);
            });

            //============== 최초 데이터 호출하는 곳은 여기 ===============================
            pokemonList(10).then((res) => {
                htmlRender(res);
            });
        });
});
