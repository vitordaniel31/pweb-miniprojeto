import useSWR from 'swr'

import Router, { useRouter } from 'next/router'
import { Error, GoBack } from '..';
import { Spin, Table, Typography } from 'antd';

export default function Movies({data}){
    const router = useRouter();

    if (router.isFallback) {
        return <Spin/>
    }

    if (!data.Results) {
        return (
            <>
                <Error error={"Make not found!"}/>
                <GoBack/>
            </>
        )
    }

    let dados = data.Results.map((m) => {
        return { 
            ...m,
            key: m.Model_ID
        };
    });

    return (
        <div>
            <div style={{marginTop: "20px"}}>
                <center>
                    <div>
                        <Typography.Title level={1} style={{ margin: 10 }}>
                            {data.Results[0].Make_ID} --- {data.Results[0].Make_Name}
                        </Typography.Title>
                    </div>
                    <GoBack/>
                    <div>
                        <Typography.Title level={4} style={{ margin: 10 }}>
                            Tipos de Veículos
                        </Typography.Title>
                    </div>
                </center>
            </div>
            <Table dataSource={dados} columns={columns}/> 
        </div>
    )    
}

const columns = [
    {
        title: 'ID', 
        dataIndex: 'Model_ID',
    },
    {
        title: 'Nome', 
        dataIndex: 'Model_Name',
    },
];

async function fetcher(url) {

    const res = await fetch(url);

    const json = await res.json();

    return json;

}

export async function getStaticPaths(){
    return {
        paths: [
            {params: {id: "11897"}},
            {params: {id: "2361"}},
            {params: {id: "8342"}},
            {params: {id: "11426"}},
            {params: {id: "2443"}},
            {params: {id: "11491"}},
            {params: {id: "8218"}},
            {params: {id: "2442"}},
            {params: {id: "6981"}},
            {params: {id: "6839"}},
        ],
        fallback: true 
    };
}

export async function getStaticProps({ params }) {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/${params.id}?format=json`);

    const data = await res.json();

    return {
      props: {
        data
      }
    };
}

