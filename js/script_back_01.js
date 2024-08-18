document.addEventListener('DOMContentLoaded', () => {
    //초기 전체 가져올 개수
    const limitNum = 150;
    let copyPokemonData = [];

    //=============== 포켓몬 정보 가공하기 =======================================
    //기본 주소를 이용하여 -> 상세정보를 가져오게되고 -> 그 정보중 일부만 사용하기 위해 다시 mixPokemonData 배열에 넣어둔다.
    const fetchPokemonList = async () => {
        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon/?limit=${limitNum}`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                //return data.results;
                console.log(data.results);

                //기본 포켓몬 정보로 상세정보
                const mixPokemonData = data.results.map((item, idx) => {
                    return {
                        name: koreanNames[idx],
                        id: idx + 1,
                        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idx + 1}.png`,
                    };
                });
                copyPokemonData = [...mixPokemonData];
                return mixPokemonData;
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
            const eleListWrap = document.querySelector('#listWrap');

            const eleDiv = document.createElement('div');
            eleDiv.id = item.id;
            eleDiv.className = 'item_box';
            const html = `<p>${item.name}</p>
            <img src="${item.image}" alt="" />
            `;
            eleDiv.innerHTML = html;
            eleListWrap.appendChild(eleDiv);
            eleDiv.addEventListener('click', function (e) {
                currentID = e.currentTarget.id;
                //=====모달열기
                document.querySelector('body').classList.add('fixed');

                const eleMonName = document.querySelector('#monName');
                const eleMonNumber = document.querySelector('#monNumber');
                const eleMonImage = document.querySelector('#monImage');
                const eleMonSummary = document.querySelector('#monSummary');
                eleMonName.textContent = item.name;
                eleMonNumber.textContent = item.id;
                eleMonImage.setAttribute('src', item.image);
            });
        });
    };

    //=====모달 닫기
    document.querySelector('#closeModal').addEventListener('click', function () {
        document.querySelector('body').classList.remove('fixed');
    });
    document.querySelector('.modal_bg_wrap').addEventListener('click', function () {
        document.querySelector('body').classList.remove('fixed');
    });

    //=========== 이름 한국어 처리 ================================
    const koreanNames = [];
    const urls = [];
    for (let i = 0; i < limitNum; i++) {
        let url = `https://pokeapi.co/api/v2/pokemon-species/${i + 1}/`; //종 에서 가져오기
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
            fetchPokemonList().then((res) => {
                htmlRender(res);
                console.log('출력', copyPokemonData);
            });
        });

    //=================search======================================================================
    const eleSchBtn = document.querySelector('#submitBtn');
    const eleSchInput = document.querySelector('#inputSearch');

    function onSearchHandler(e) {
        searchKeyword = eleSchInput.value.trim().toLowerCase();
        if (searchKeyword === '') eleSchInput.value = '';
        //============== 검색 실행 ===============================
        document.querySelector('#listWrap').innerHTML = '';
        fetchPokemonList().then((res) => {
            const filtered = res.filter((item) => {
                return item.name.includes(searchKeyword);
            });
            console.log('필터값 : ', filtered);
            htmlRender(filtered);
        });
    }
    eleSchBtn.addEventListener('click', function () {
        onSearchHandler();
    });
    eleSchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            onSearchHandler();
        }
    });

    //=================search reset======================================================================
    /*  const eleSchResetBtn = document.querySelector('#schResetBtn');
    eleSchResetBtn.addEventListener('click', () => {
        eleSchInput.value = '';
        searchKeyword = '';
        limit = 10;
        loadPost();
    }); */
});
