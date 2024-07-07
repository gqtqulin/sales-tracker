# album-tracker

hardhat solidity pet-project (guidedao)

## цель проекта


## hardhat тесты


```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
# npx hardhat ignition deploy ./ignition/modules/Lock.js
```

TODO:
[+] комментирование контрактов
[+] импорт chai, deploy контракта, создание альбома, как подключать к тестам hardhat ethers.js
[+] тест AlbumTracker - получить адресс контракта развернутого, подключиться к контракту, получить стейты контракта под expext()
[+] тест Album - проверить что альбом добавляется в mapping, получить его структуру данных, считать логи с deploy контракта
и забрать с него topics (адрес нового контракта, посмотреть что там лежит)
[+] протестировать событие создания
```js
    let receiptTx = {} // -- вернувшиеся логи после деплоя 
    let contract = {} // -- AlbumTracker - контракт, порождающий транзакцию ?
    // -- await ставится с emit
    await expect(receiptTx).to.emit(contract, "eventName").withArgs("args", "to", "event") 
```
[+] проверить покупку (стейт альбом)
[+] проверить изменение балансом стейтом:
```js 
ethers.changeEthersChanges()
```
[-] сделать coverage и дописать тесты
[-] hardhat-gas-reporter посмотреть как работает
