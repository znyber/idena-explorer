import Link from 'next/link'
import {NavItem, NavLink, TabPane, TabContent} from 'reactstrap'
import {useQuery} from 'react-query'
import {useRouter} from 'next/router'
import Layout from '../../shared/components/layout'
import {
  getEpochsCount,
  getIdentity,
  getAddressInfo,
  getContract,
  getPool,
  getAddressChangesSummary,
} from '../../shared/api'
import {dnaFmt, identityStatusFmt} from '../../shared/utils/utils'
import Transactions from '../../screens/address/components/transactions'
import Rewards from '../../screens/address/components/rewards'
import Penalties from '../../screens/address/components/penalties'
import BalanceHistory from '../../screens/address/components/balances'
import {useHash, useHashChange} from '../../shared/utils/useHashChange'
import TooltipText from '../../shared/components/tooltip'

const DEFAULT_TAB = '#transactions'

function Address() {
  const router = useRouter()
  const {address} = router.query

  const {hash, setHash, hashReady} = useHash()
  useHashChange((hash) => setHash(hash))

  const {data: addressInfo} = useQuery(
    address && ['balance', address],
    (_, address) => getAddressInfo(address)
  )

  const {data: epochsCount} = useQuery(
    address && ['epochs', address],
    (_, address) => getEpochsCount(address)
  )

  const {data: identityInfo} = useQuery(
    epochsCount && ['identity', address],
    (_, address) => getIdentity(address)
  )

  const {data: contractInfo} = useQuery(
    address && ['contract', address],
    (_, address) => getContract(address)
  )

  const {data: poolInfo} = useQuery(
    address && ['pool', address],
    (_, address) => getPool(address)
  )

  const {data: activityInfo} = useQuery(
    address && ['address', address],
    (_, address) => getAddressChangesSummary(address)
  )

  return (
    <Layout title={`Address ${address}`}>
      <section className="section">
        <div className="section_main__group">
          <h1 className="section_main__title">Address</h1>
          <h3 className="section_main__subtitle">
            <span>{address}</span>
          </h3>
        </div>
      </section>

      <AddressData
        addressInfo={addressInfo}
        identityInfo={identityInfo}
        contractInfo={contractInfo}
        poolInfo={poolInfo}
        activityInfo={activityInfo}
      />

      <section className="section section_tabs">
        <div className="tabs">
          <div className="section__header">
            <div className="row align-items-center justify-content-between">
              <div className="col">
                <ul className="nav nav-tabs" role="tablist">
                  <NavItem>
                    <NavLink
                      active={
                        hashReady && (hash === DEFAULT_TAB || hash === '')
                      }
                      href={DEFAULT_TAB}
                    >
                      <h3>Transactions</h3>
                    </NavLink>
                  </NavItem>

                  {identityInfo && (
                    <>
                      <NavItem>
                        <NavLink
                          active={hashReady && hash === '#rewards'}
                          href="#rewards"
                        >
                          <h3>Rewards</h3>
                        </NavLink>
                      </NavItem>

                      <NavItem>
                        <NavLink
                          active={hashReady && hash === '#penalty'}
                          href="#penalty"
                        >
                          <h3>Mining penalty</h3>
                        </NavLink>
                      </NavItem>
                    </>
                  )}
                  <NavItem>
                    <NavLink
                      active={hashReady && hash === '#history'}
                      href="#history"
                    >
                      <h3>Balance history</h3>
                    </NavLink>
                  </NavItem>
                </ul>
              </div>
            </div>
          </div>

          <TabContent activeTab={hashReady ? hash || DEFAULT_TAB : ''}>
            <TabPane tabId={DEFAULT_TAB}>
              <div className="card">
                <Transactions
                  address={address}
                  visible={hashReady && (hash === DEFAULT_TAB || !hash)}
                />
              </div>
            </TabPane>
            <TabPane tabId="#rewards">
              <div className="card">
                <Rewards
                  address={address}
                  visible={hashReady && hash === '#rewards'}
                />
              </div>
            </TabPane>
            <TabPane tabId="#penalty">
              <div className="card">
                <Penalties
                  address={address}
                  visible={hashReady && hash === '#penalty'}
                />
              </div>
            </TabPane>
            <TabPane tabId="#history">
              <div className="card">
                <BalanceHistory
                  address={address}
                  visible={hashReady && hash === '#history'}
                />
              </div>
            </TabPane>
          </TabContent>
        </div>
      </section>
    </Layout>
  )
}

function AddressData({
  addressInfo,
  identityInfo,
  contractInfo,
  poolInfo,
  activityInfo,
}) {
  return (
    <>
      <section className="section section_info">
        <div className="row">
          <div className="col-12 col-sm-12">
            <h3>Summary</h3>
            <div className="card">
              <div className="info_block">
                <div className="row">
                  <div
                    className={`col-12 ${
                      identityInfo ? 'col-sm-4' : 'col-sm-6'
                    } bordered-col`}
                  >
                    <h3 className="info_block__accent">
                      {(addressInfo && dnaFmt(addressInfo.balance)) || '-'}
                    </h3>
                    <TooltipText
                      className="control-label"
                      data-toggle="tooltip"
                      tooltip="Available balance"
                    >
                      Balance
                    </TooltipText>
                  </div>
                  <div
                    className={`col-12 ${
                      identityInfo ? 'col-sm-4' : 'col-sm-6'
                    } bordered-col`}
                    style={{display: identityInfo ? 'block' : 'none'}}
                  >
                    <h3 className="info_block__accent">
                      {(addressInfo && dnaFmt(addressInfo.stake)) || '-'}
                    </h3>
                    <TooltipText
                      className="control-label"
                      data-toggle="tooltip"
                      tooltip="Frozen balance"
                    >
                      Stake
                    </TooltipText>
                  </div>
                  <div
                    className={`col-12 ${
                      identityInfo ? 'col-sm-4' : 'col-sm-6'
                    } bordered-col`}
                  >
                    <h3 className="info_block__accent">
                      {(addressInfo && addressInfo.txCount) || '-'}
                    </h3>
                    <div className="control-label">Transactions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {identityInfo && (
        <section className="section section_details">
          <h3>Owner</h3>
          <div className="card">
            <div className="row">
              <div className="col-12 col-sm-6">
                <div className="section__group">
                  <div className="control-label">Identity:</div>
                  <div
                    className="text_block text_block--ellipsis"
                    style={{width: '80%'}}
                  >
                    <Link
                      href="/identity/[address]"
                      as={`/identity/${identityInfo.address}`}
                    >
                      <a>
                        <img
                          alt="user-pic"
                          className="user-pic"
                          width="32"
                          src={`https://robohash.idena.io/${identityInfo.address.toLowerCase()}`}
                        />
                        <span>{identityInfo.address}</span>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="section__group">
                  <div className="control-label">Status:</div>
                  <div className="text_block">
                    {identityStatusFmt(identityInfo.state)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {contractInfo && (
        <section className="section section_details">
          <h3>Smart contract</h3>
          <div className="card">
            <div className="row">
              <div className="col-12 col-sm-6">
                <div className="section__group">
                  <div className="control-label">Address:</div>
                  <div
                    className="text_block text_block--ellipsis"
                    style={{width: '80%'}}
                  >
                    <Link
                      href="/contract/[address]"
                      as={`/contract/${contractInfo.address}`}
                    >
                      <a>
                        <img
                          alt="user-pic"
                          className="user-pic"
                          width="32"
                          src={`https://robohash.org/${contractInfo.address.toLowerCase()}`}
                        />
                        <span>{contractInfo.address}</span>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="section__group">
                  <div className="control-label">Type:</div>
                  <div className="text_block">{contractInfo.type}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {poolInfo && (
        <section className="section section_details">
          <h3>Pool</h3>
          <div className="card">
            <div className="row">
              <div className="col-12 col-sm-6">
                <div className="section__group">
                  <div className="control-label">Address:</div>
                  <div
                    className="text_block text_block--ellipsis"
                    style={{width: '80%'}}
                  >
                    <Link
                      href="/pool/[address]"
                      as={`/pool/${poolInfo.address}`}
                    >
                      <a>
                        <img
                          alt="user-pic"
                          className="user-pic"
                          width="32"
                          src={`https://robohash.org/${poolInfo.address.toLowerCase()}`}
                        />
                        <span>{poolInfo.address}</span>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="section__group">
                  <div className="control-label">Size:</div>
                  <div className="text_block">{poolInfo.size}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section section_details">
        <h3>Details</h3>
        <div className="card">
          <div className="row">
            <div className="col-12 col-sm-6">
              <div className="section__group">
                <div className="control-label">Total received:</div>
                <div className="text_block">
                  {(activityInfo && dnaFmt(activityInfo.balanceIn)) || '-'}
                </div>
                {activityInfo &&
                  (activityInfo.stakeOut > 0 || activityInfo.stakeIn) > 0 && (
                    <>
                      <hr />
                      <div className="control-label">Total stake received:</div>
                      <div className="text_block">
                        {(activityInfo && dnaFmt(activityInfo.stakeIn)) || '-'}
                      </div>
                    </>
                  )}
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="section__group">
                <div className="control-label">Total sent:</div>
                <div className="text_block">
                  {(activityInfo && dnaFmt(activityInfo.balanceOut)) || '-'}
                </div>
                {activityInfo &&
                  (activityInfo.stakeOut > 0 || activityInfo.stakeIn) > 0 && (
                    <>
                      <hr />
                      <div className="control-label">
                        Total stake sent or burnt:
                      </div>
                      <div className="text_block">
                        {(activityInfo && dnaFmt(activityInfo.stakeOut)) || '-'}
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Address
