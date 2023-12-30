# ens-labels

<!-- summary -->
`2,761,964` unique, stop-free labels as of `2023-12-30` collected from ENS contract events and primary name records. 
 * [`40.0MB`](https://github.com/adraffy/ens-labels/raw/master/labels.json) — [labels.json](./labels.json)<br>`6e256952c3a557681bcae08bce34868975c4e11a221b229fc8d7728f8a4b6b18` (SHA256)
<!-- /summary -->

[**Demo**](https://adraffy.github.io/ens-labels/demo.html) ⭐

![Plot](plot.png)

```Javascript
import {read_labels} from './labels.js';

let labels = read_labels(); // string[]
```

## Length Distribution

<!-- table -->
| N | # | % |
| ---: | ---: | ---: |
| 0 | 1 | 0.0000% |
| 1 | 39 | 0.0014% |
| 2 | 130 | 0.0047% |
| 3 | 47311 | 1.7129% |
| 4 | 100839 | 3.6510% |
| 5 | 389684 | 14.1089% |
| 6 | 353324 | 12.7925% |
| 7 | 312084 | 11.2994% |
| 8 | 313279 | 11.3426% |
| 9 | 263072 | 9.5248% |
| 10 | 235637 | 8.5315% |
| 11 | 189457 | 6.8595% |
| 12 | 152992 | 5.5392% |
| 13 | 113047 | 4.0930% |
| 14 | 84442 | 3.0573% |
| 15 | 61178 | 2.2150% |
| 16 | 41261 | 1.4939% |
| 17 | 28504 | 1.0320% |
| 18 | 20285 | 0.7344% |
| 19 | 14147 | 0.5122% |
| 20 | 10430 | 0.3776% |
| 21 | 7242 | 0.2622% |
| 22 | 4815 | 0.1743% |
| 23 | 3582 | 0.1297% |
| 24 | 2760 | 0.0999% |
| 25 | 1823 | 0.0660% |
| 26 | 1393 | 0.0504% |
| 27 | 1146 | 0.0415% |
| 28 | 972 | 0.0352% |
| 29 | 615 | 0.0223% |
| 30+ | 6473 | 0.2344% |
<!-- /table -->

## Longest Labels

<!-- longest -->
| N | Bytes | Labelhash |
| ---: | ---: | :--- |
| 38894 | 116682 | [`51592185a7ebb018d50f7acfd13011e66d39d351af698ce9a733a724c70d0786`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x51592185a7ebb018d50f7acfd13011e66d39d351af698ce9a733a724c70d0786)
| 38894 | 38894 | [`6b65f209340a98cfe6c5fdc21be6e2b32d6855e817ab83ec6cca8da990fa8d25`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x6b65f209340a98cfe6c5fdc21be6e2b32d6855e817ab83ec6cca8da990fa8d25)
| 38894 | 38894 | [`3810d408f40f56ffab7c06d105918d740af3e629f84bf03c920bc6709d3eec6d`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x3810d408f40f56ffab7c06d105918d740af3e629f84bf03c920bc6709d3eec6d)
| 38894 | 38894 | [`efc93dfe2a8ca19f2795760acba6b559ac0809028ea86c4e81cd2bd786668afa`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0xefc93dfe2a8ca19f2795760acba6b559ac0809028ea86c4e81cd2bd786668afa)
| 38894 | 38894 | [`d0c3c77adc6d6771fa2210b31d4241a260819e1613443757a45a8a1e606ec835`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0xd0c3c77adc6d6771fa2210b31d4241a260819e1613443757a45a8a1e606ec835)
| 37058 | 37058 | [`9d7b472bcba4e71d1c05daab624a4896c6d5a8b40adaf64c0006e0b5afcbe343`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x9d7b472bcba4e71d1c05daab624a4896c6d5a8b40adaf64c0006e0b5afcbe343)
| 33792 | 101376 | [`81acf311f29dc4c83dd0a213468803f4befc2ce3c04bfaaf8852e801c97f2d15`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x81acf311f29dc4c83dd0a213468803f4befc2ce3c04bfaaf8852e801c97f2d15)
| 32745 | 32745 | [`97f3a8086a50bd2fab79c3ab50e1cc7ffd20f46f6d6dcedb65ea0f44464a3a2d`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x97f3a8086a50bd2fab79c3ab50e1cc7ffd20f46f6d6dcedb65ea0f44464a3a2d)
| 32713 | 32713 | [`f9da64a5938b21cac4a673030b71ec5c997ab401557239480661876637baf818`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0xf9da64a5938b21cac4a673030b71ec5c997ab401557239480661876637baf818)
| 29425 | 117700 | [`2984778431ebdb5b58239741cbd3b5d132d84eefe6b45cd7820dd4bf59e82e24`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x2984778431ebdb5b58239741cbd3b5d132d84eefe6b45cd7820dd4bf59e82e24)
| 14842 | 14842 | [`ab277f834e1512b904dbf9a4e5f9f23460e356a1652c2a678752bc534e76f04d`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0xab277f834e1512b904dbf9a4e5f9f23460e356a1652c2a678752bc534e76f04d)
| 11111 | 11111 | [`2cc6bb5b970029045f87aed33a797e1f6f9fb05884c5ba6818fc94d0a1fda11d`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x2cc6bb5b970029045f87aed33a797e1f6f9fb05884c5ba6818fc94d0a1fda11d)
| 10245 | 10245 | [`31a19c964c4f919354eab4398499668d6a598ac71597d9634b4e91a36898a3d5`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x31a19c964c4f919354eab4398499668d6a598ac71597d9634b4e91a36898a3d5)
| 10000 | 30000 | [`801797b1581f72969312af85f7ac5e79b964a9525e65ba22c02d169f981b5cc2`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x801797b1581f72969312af85f7ac5e79b964a9525e65ba22c02d169f981b5cc2)
| 10000 | 40000 | [`736473f178e0f659e8e389f9a919f44fe95848b6ca090e7083f980e411776af4`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x736473f178e0f659e8e389f9a919f44fe95848b6ca090e7083f980e411776af4)
| 10000 | 10000 | [`ec5779527b23c6f203e1b248e21addf86ab5e8b61cc07404ae0f869933de9c0a`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0xec5779527b23c6f203e1b248e21addf86ab5e8b61cc07404ae0f869933de9c0a)
| 10000 | 10000 | [`08a34cfd9c55bd8fc8c2124be5d4ae2e26d817f07cd3b43ef2b1d363b6c110a6`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x08a34cfd9c55bd8fc8c2124be5d4ae2e26d817f07cd3b43ef2b1d363b6c110a6)
| 10000 | 10000 | [`02b8be2b5ebbd2b9dfa241cc2e06905c3aebc6b93a65a996c709db5da48cf02b`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x02b8be2b5ebbd2b9dfa241cc2e06905c3aebc6b93a65a996c709db5da48cf02b)
| 10000 | 40000 | [`a5f1a998bbf992d1e8384c0200f003770c489b25707ecb68b1c5a5dfd0f2ad20`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0xa5f1a998bbf992d1e8384c0200f003770c489b25707ecb68b1c5a5dfd0f2ad20)
| 9999 | 9999 | [`0a59c943ab7fea65ac5aff5fb61a58e01010b9379aa2e961b559ed3843cf6187`](https://adraffy.github.io/ens-normalize.js/test/resolver.html#token:0x0a59c943ab7fea65ac5aff5fb61a58e01010b9379aa2e961b559ed3843cf6187)
<!-- /longest -->
