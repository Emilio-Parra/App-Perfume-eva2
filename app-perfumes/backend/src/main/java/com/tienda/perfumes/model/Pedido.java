package com.tienda.perfumes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import java.util.List;
import java.util.ArrayList;


@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private LocalDateTime fecha;
    private String estado;
    private Integer intentos;
    private Integer total;

    // Datos de entrega de cada pedido (persistidos en MySQL)
    @Column(length = 50)
    private String clienteNombre;

    @Column(length = 100)
    private String clienteApellido;

    @Column(length = 100)
    private String clienteCorreo;

    @Column(length = 300)
    private String envioCalle;

    @Column(length = 20)
    private String envioDepartamento;

    @Column(length = 100)
    private String envioRegion;

    @Column(length = 100)
    private String envioComuna;

    @Column(length = 300)
    private String envioIndicaciones;


    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;


    @OneToMany(mappedBy = "pedido",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<DetallePedido> detalles = new ArrayList<>();


    public Pedido() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getIntentos() {
        return intentos;
    }

    public void setIntentos(Integer intentos) {
        this.intentos = intentos;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }


    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public String getClienteApellido() {
        return clienteApellido;
    }

    public void setClienteApellido(String clienteApellido) {
        this.clienteApellido = clienteApellido;
    }

    public String getClienteCorreo() {
        return clienteCorreo;
    }

    public void setClienteCorreo(String clienteCorreo) {
        this.clienteCorreo = clienteCorreo;
    }

    public String getEnvioCalle() {
        return envioCalle;
    }

    public void setEnvioCalle(String envioCalle) {
        this.envioCalle = envioCalle;
    }

    public String getEnvioDepartamento() {
        return envioDepartamento;
    }

    public void setEnvioDepartamento(String envioDepartamento) {
        this.envioDepartamento = envioDepartamento;
    }

    public String getEnvioRegion() {
        return envioRegion;
    }

    public void setEnvioRegion(String envioRegion) {
        this.envioRegion = envioRegion;
    }

    public String getEnvioComuna() {
        return envioComuna;
    }

    public void setEnvioComuna(String envioComuna) {
        this.envioComuna = envioComuna;
    }

    public String getEnvioIndicaciones() {
        return envioIndicaciones;
    }

    public void setEnvioIndicaciones(String envioIndicaciones) {
        this.envioIndicaciones = envioIndicaciones;
    }

    public List<DetallePedido> getDetalles() {
        return detalles;
    }

    public void agregarDetalle(DetallePedido detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }

}
