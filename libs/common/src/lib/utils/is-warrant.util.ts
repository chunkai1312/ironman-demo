enum WarrantType {
  CallWarrantsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之認購權證
  PutWarrantsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之認售權證
  CallWarrantsForForeignSecuritiesOrIndexes, // 以外國證券或指數為標的之認購權證
  PutWarrantsForForeignSecuritiesOrIndexes, // 以外國證券或指數為標的之認售權證
  CallableBullContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「下限型認購權證」牛證
  CallableBearContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「上限型認售權證」熊證
  ExtendableCallableBullContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「可展延型下限型認購權證」可展延型牛證
  ExtendableCallableBearContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「可展延型上限型認售權證」可展延型熊證
  OtcCallWarrantsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之認購權證
  OtcPutWarrantsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之認售權證
  OtcCallWarrantsForForeignSecuritiesOrIndexes, // 以外國證券或指數為標的之認購權證
  OtcPutWarrantsForForeignSecuritiesOrIndexes, // 以外國證券或指數為標的之認售權證
  OtcCallableBullContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「下限型認購權證」牛證
  OtcCallableBearContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「上限型認售權證」熊證
  OtcExtendableCallableBullContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「可展延型下限型認購權證」可展延型牛證
  OtcExtendableCallableBearContractsForDomesticSecuritiesOrIndexes, // 以國內證券或指數為標的之「可展延型上限型認售權證」可展延型熊證
}

const WARRANT_CODING_RULES = {
  [WarrantType.CallWarrantsForDomesticSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9][0-9]$/, // 以國內證券或指數為標的之認購權證
  [WarrantType.PutWarrantsForDomesticSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9]P$/, // 以國內證券或指數為標的之認售權證
  [WarrantType.CallWarrantsForForeignSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9]F$/, // 以外國證券或指數為標的之認購權證
  [WarrantType.PutWarrantsForForeignSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9]Q$/, // 以外國證券或指數為標的之認售權證
  [WarrantType.CallableBullContractsForDomesticSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9]C$/, // 以國內證券或指數為標的之「下限型認購權證」(牛證)
  [WarrantType.CallableBearContractsForDomesticSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9]B$/, // 以國內證券或指數為標的之「上限型認售權證」(熊證)
  [WarrantType.ExtendableCallableBullContractsForDomesticSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9]X$/, // 以國內證券或指數為標的之「可展延型下限型認購權證」(可展延型牛證)
  [WarrantType.ExtendableCallableBearContractsForDomesticSecuritiesOrIndexes]: /^0[3-8][0-9][0-9][0-9]Y$/, // 以國內證券或指數為標的之「可展延型上限型認售權證」(可展延型熊證)
  [WarrantType.OtcCallWarrantsForDomesticSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9][0-9]$/, // 以國內證券或指數為標的之認購權證
  [WarrantType.OtcPutWarrantsForDomesticSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9]P$/, // 以國內證券或指數為標的之認售權證
  [WarrantType.OtcCallWarrantsForForeignSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9]F$/, // 以外國證券或指數為標的之認購權證
  [WarrantType.OtcPutWarrantsForForeignSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9]Q$/, // 以外國證券或指數為標的之認售權證
  [WarrantType.OtcCallableBullContractsForDomesticSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9]C$/, // 以國內證券或指數為標的之「下限型認購權證」(牛證)
  [WarrantType.OtcCallableBearContractsForDomesticSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9]B$/, // 以國內證券或指數為標的之「上限型認售權證」(熊證)
  [WarrantType.OtcExtendableCallableBullContractsForDomesticSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9]X$/, // 以國內證券或指數為標的之「可展延型下限型認購權證」(可展延型牛證)
  [WarrantType.OtcExtendableCallableBearContractsForDomesticSecuritiesOrIndexes]: /^7[0-3][0-9][0-9][0-9]Y$/, // 以國內證券或指數為標的之「可展延型上限型認售權證」(可展延型熊證)
};

export function isWarrant(symbol: string): boolean {
  return Object.entries(WARRANT_CODING_RULES).some(([type, regex]) => regex.test(symbol));
}
