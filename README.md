# ens-labels

<!-- summary -->
`2,790,590` unique, stop-free labels as of `2024-01-27` collected from ENS contract events and primary name records. 
 * [`40.4MB`](https://github.com/adraffy/ens-labels/raw/master/labels.json) — [labels.json](./labels.json)<br>`acf2fd5b5e0316f5bbfcf4f2fbcb68b87dac8430ab06f4258498cc5a5d973671` (SHA256)
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
| 0 | 0 | 0.0000% |
| 1 | 39 | 0.0014% |
| 2 | 130 | 0.0047% |
| 3 | 47316 | 1.6956% |
| 4 | 100944 | 3.6173% |
| 5 | 392246 | 14.0560% |
| 6 | 356957 | 12.7915% |
| 7 | 315811 | 11.3170% |
| 8 | 317194 | 11.3666% |
| 9 | 266512 | 9.5504% |
| 10 | 238658 | 8.5522% |
| 11 | 191821 | 6.8739% |
| 12 | 154740 | 5.5451% |
| 13 | 114273 | 4.0949% |
| 14 | 85323 | 3.0575% |
| 15 | 61796 | 2.2144% |
| 16 | 41641 | 1.4922% |
| 17 | 28779 | 1.0313% |
| 18 | 20498 | 0.7345% |
| 19 | 14284 | 0.5119% |
| 20 | 10519 | 0.3769% |
| 21 | 7317 | 0.2622% |
| 22 | 4872 | 0.1746% |
| 23 | 3617 | 0.1296% |
| 24 | 2783 | 0.0997% |
| 25 | 1839 | 0.0659% |
| 26 | 1405 | 0.0503% |
| 27 | 1154 | 0.0414% |
| 28 | 979 | 0.0351% |
| 29 | 617 | 0.0221% |
| 30+ | 6526 | 0.2339% |
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
